import React, { forwardRef, useImperativeHandle, useRef, useCallback } from "react";
import moment from "moment";

const DailySummaryPrint = forwardRef(({ profileData, summaryData, reportDate }, ref) => {
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
                    <title>Daily Summary</title>
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
        container: { fontFamily: "'Courier New', Courier, monospace", width: "72mm", margin: "auto", padding: "10px", fontSize: "12px", color: "#000", backgroundColor: "#fff" },
        header: { textAlign: "center", marginBottom: "10px" },
        dashedLine: { margin: "8px 0", borderTop: "1px dashed #000" },
        companyName: { fontSize: "18px", fontWeight: "bold", marginBottom: "2px" },
        infoText: { fontSize: "12px", margin: "2px 0" },
        sectionTitle: { fontWeight: 'bold', textTransform: 'uppercase', marginTop: '12px', marginBottom: '6px', borderBottom: '1px dashed #000', paddingBottom: '2px' },
        summaryRow: { display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: '12px' },
        footer: { textAlign: "center", marginTop: "10px", fontSize: "10px" },
    };

    if (!profileData || !summaryData) return null;

    const netSales = summaryData.totalAmount || 0;
    const grossSales = netSales + (summaryData.totalDiscount || 0);
    const avgPerPerson = summaryData.totalGuestCount > 0 ? netSales / summaryData.totalGuestCount : 0;

    const deliveryProviderLabels = {
        pathao: "Pathao",
        foodi: "Foodi",
        foodpanda: "Foodpanda",
        deliveryBoy: "Delivery Boy"
    };

    return (
        <div ref={internalPrintRef} style={styles.container}>
            <header style={styles.header}>
                <h2 style={styles.companyName}>{profileData?.name}</h2>
                <p style={styles.infoText}>{profileData?.address}</p>
                <p style={styles.infoText}>Daily Sales Summary</p>
                <p style={styles.infoText}>{moment(reportDate).format("MMMM Do, YYYY")}</p>
            </header>
            
            <div style={styles.dashedLine}></div>

            <section>
                <h3 style={styles.sectionTitle}>Sales Overview</h3>
                <div style={styles.summaryRow}><span>Gross Sales:</span><span>৳{grossSales.toFixed(2)}</span></div>
                <div style={styles.summaryRow}><span>Total Discount:</span><span>- ৳{summaryData.totalDiscount.toFixed(2)}</span></div>
                <div style={styles.summaryRow}><span>Table Discount:</span><span>- ৳{summaryData.totalTableDiscount.toFixed(2)}</span></div>
                <div style={styles.summaryRow}><span>Complimentary:</span><span>- ৳{summaryData.totalComplimentaryAmount.toFixed(2)}</span></div>
                <div style={styles.summaryRow}><strong>Net Sales:</strong><strong>৳{netSales.toFixed(2)}</strong></div>
                <div style={styles.summaryRow}><span>Total VAT:</span><span>৳{summaryData.totalVat.toFixed(2)}</span></div>
                <div style={styles.summaryRow}><span>Total SD:</span><span>৳{summaryData.totalSd.toFixed(2)}</span></div>
            </section>
            
            <section>
                <h3 style={styles.sectionTitle}>Collections</h3>
                <div style={styles.summaryRow}><span>Cash:</span><span>৳{summaryData.cashPayments.toFixed(2)}</span></div>
                <div style={styles.summaryRow}><span>Card:</span><span>৳{summaryData.cardPayments.toFixed(2)}</span></div>
                <div style={styles.summaryRow}><span>Mobile Banking:</span><span>৳{summaryData.mobilePayments.toFixed(2)}</span></div>
                <div style={styles.summaryRow}><span>Bank:</span><span>৳{summaryData.bankPayments.toFixed(2)}</span></div>
            </section>
            
            <section>
                <h3 style={styles.sectionTitle}>Order Types</h3>
                {summaryData.salesByOrderType && Object.entries(summaryData.salesByOrderType).map(([type, amount]) => (
                     <div key={type} style={styles.summaryRow}>
                        <span style={{textTransform: 'capitalize'}}>{type.replace('-', ' ')}:</span>
                        <span>৳{amount.toFixed(2)}</span>
                    </div>
                ))}
            </section>

            <section>
                <h3 style={styles.sectionTitle}>Delivery Providers</h3>
                 {summaryData.salesByDeliveryProvider && Object.entries(summaryData.salesByDeliveryProvider).map(([provider, amount]) => (
                    amount > 0 && 
                    <div key={provider} style={styles.summaryRow}>
                        <span>{deliveryProviderLabels[provider] || provider}:</span>
                        <span>৳{amount.toFixed(2)}</span>
                    </div>
                ))}
            </section>

            <section>
                <h3 style={styles.sectionTitle}>Guest Info</h3>
                <div style={styles.summaryRow}><span>Total Guests:</span><span>{summaryData.totalGuestCount}</span></div>
                <div style={styles.summaryRow}><span>Avg/Person:</span><span>৳{avgPerPerson.toFixed(2)}</span></div>
            </section>

            <div style={styles.dashedLine}></div>
            <footer style={styles.footer}>
                <p>Printed: {new Date().toLocaleString()}</p>
            </footer>
        </div>
    );
});
DailySummaryPrint.displayName = 'DailySummaryPrint';

export default DailySummaryPrint;