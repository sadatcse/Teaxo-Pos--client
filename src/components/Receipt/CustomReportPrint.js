import React, { forwardRef, useImperativeHandle, useRef, useCallback } from "react";
import moment from "moment";

const CustomReportPrint = forwardRef(({ profileData, summaryData, filters }, ref) => {
    const internalPrintRef = useRef();

    const printReceipt = useCallback(() => {
        const node = internalPrintRef.current;
        if (!node) return;

        const iframe = document.createElement("iframe");
        iframe.style.cssText = "position:absolute;width:0;height:0;top:-10000px;";
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;

        doc.open();
        doc.write(`
            <html>
                <head>
                    <title>Custom Report Summary</title>
                    <style>
                        @media print {
                            @page { margin: 0; size: 72mm auto; }
                            body { margin: 0; font-family: 'Courier New', Courier, monospace; color: #000; }
                        }
                    </style>
                </head>
                <body>${node.outerHTML}</body>
            </html>
        `);
        doc.close();
        
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 500);
    }, []);

    useImperativeHandle(ref, () => ({ printReceipt }));
    
    const styles = {
        container: { fontFamily: "'Courier New', Courier, monospace", width: "72mm", padding: "10px",margin: "auto",  fontSize: "12px", color: "#000" },
        header: { textAlign: "center", marginBottom: "10px" },
        dashedLine: { margin: "8px 0", borderTop: "1px dashed #000" },
        companyName: { fontSize: "18px", fontWeight: "bold", marginBottom: "2px" },
        infoText: { fontSize: "12px", margin: "2px 0" },
        sectionTitle: { fontWeight: 'bold', textTransform: 'uppercase', marginTop: '12px', marginBottom: '6px', borderBottom: '1px dashed #000', paddingBottom: '2px' },
        row: { display: 'flex', justifyContent: 'space-between', padding: '2px 0' },
        subRow: { display: 'flex', justifyContent: 'space-between', padding: '1px 0 1px 15px', fontSize: '11px' },
        footer: { textAlign: "center", marginTop: "10px", fontSize: "10px" },
    };

    if (!profileData || !summaryData?.totalSales) return null;

    const { totalSales, taxesAndDiscounts, complimentaryItems, salesByOrderType, salesByPaymentMethod } = summaryData;
    const grossSales = (totalSales.totalAmount || 0) + (taxesAndDiscounts.totalDiscount || 0);

    return (
        <div ref={internalPrintRef} style={styles.container}>
            <header style={styles.header}>
                <h2 style={styles.companyName}>{profileData.name}</h2>
                <p style={styles.infoText}>Custom Sales Summary</p>
                <p style={styles.infoText}>{moment(filters.startDate).format("DD/MM/YY")} to {moment(filters.endDate).format("DD/MM/YY")}</p>
            </header>
            
            <div style={styles.dashedLine}></div>

            <section>
                <h3 style={styles.sectionTitle}>Sales Overview</h3>
                <div style={styles.row}><span>Gross Sales:</span><span>৳{grossSales.toFixed(2)}</span></div>
                <div style={styles.row}><span>Total Discount:</span><span>- ৳{(taxesAndDiscounts.totalDiscount || 0).toFixed(2)}</span></div>
                <div style={styles.row}><span>Table Discount:</span><span>- ৳{(taxesAndDiscounts.totalTableDiscount || 0).toFixed(2)}</span></div>
                <div style={styles.row}><span>Complimentary:</span><span>- ৳{(complimentaryItems.totalComplimentaryAmount || 0).toFixed(2)}</span></div>
                <div style={styles.row}><strong>Net Sales:</strong><strong>৳{(totalSales.totalAmount || 0).toFixed(2)}</strong></div>
                <div style={styles.row}><span>Total VAT:</span><span>৳{(taxesAndDiscounts.totalVat || 0).toFixed(2)}</span></div>
                <div style={styles.row}><span>Total SD:</span><span>৳{(taxesAndDiscounts.totalSd || 0).toFixed(2)}</span></div>
                 <div style={styles.row}><span>Items Sold:</span><span>{totalSales.totalQty || 0}</span></div>
                <div style={styles.row}><span>Avg Order Value:</span><span>৳{(totalSales.averageOrderValue || 0).toFixed(2)}</span></div>
            </section>
            
            <section>
                <h3 style={styles.sectionTitle}>Collections</h3>
                {Object.entries(salesByPaymentMethod).map(([key, value]) => {
                    if (!value || value.totalAmount <= 0) return null;
                    return (
                        <div key={key}>
                            <div style={styles.row}>
                                <span style={{textTransform: 'capitalize'}}>{key} ({value.invoiceCount}):</span>
                                <span>৳{(value.totalAmount || 0).toFixed(2)}</span>
                            </div>
                            {key === 'card' && Object.entries(value).filter(([k]) => k.endsWith('Card')).map(([cardType, cardValue]) => (
                                (cardValue.totalAmount > 0) && <div key={cardType} style={styles.subRow}><span style={{textTransform: 'capitalize'}}>{cardType.replace('Card', ' Card')}:</span><span>৳{(cardValue.totalAmount || 0).toFixed(2)}</span></div>
                            ))}
                            {key === 'mobile' && Object.entries(value).filter(([k]) => !['totalAmount', 'invoiceCount'].includes(k)).map(([mobileType, mobileValue]) => (
                                (mobileValue.totalAmount > 0) && <div key={mobileType} style={styles.subRow}><span style={{textTransform: 'capitalize'}}>{mobileType}:</span><span>৳{(mobileValue.totalAmount || 0).toFixed(2)}</span></div>
                            ))}
                        </div>
                    );
                })}
            </section>
            
            <section>
                <h3 style={styles.sectionTitle}>Order Types</h3>
                {Object.entries(salesByOrderType).map(([key, value]) => (
                    value.totalAmount > 0 &&
                    <div key={key}>
                        <div style={styles.row}>
                            <span style={{textTransform: 'capitalize'}}>{key.replace(/([A-Z])/g, ' $1').trim()} ({value.invoiceCount}):</span>
                            <span>৳{(value.totalAmount || 0).toFixed(2)}</span>
                        </div>
                         {key === 'delivery' && value.providers && Object.entries(value.providers).map(([provider, providerValue]) => (
                            providerValue.totalAmount > 0 && <div key={provider} style={styles.subRow}><span style={{textTransform: 'capitalize'}}>{provider}:</span><span>৳{(providerValue.totalAmount || 0).toFixed(2)}</span></div>
                         ))}
                    </div>
                ))}
            </section>

            <div style={styles.dashedLine}></div>
            <footer style={styles.footer}>
                <p>Printed: {new Date().toLocaleString()}</p>
            </footer>
        </div>
    );
});
CustomReportPrint.displayName = 'CustomReportPrint';
export default CustomReportPrint;