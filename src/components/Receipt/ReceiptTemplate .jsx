import React, { forwardRef, useEffect, useState } from "react";

// ReceiptTemplate is a functional component that displays a detailed invoice receipt.
// It receives profileData (company info) and invoiceData (order details) as props.
// It's forwardRef'd to allow parent components to access its DOM node for printing.
const ReceiptTemplate = forwardRef(({ profileData, invoiceData, onPrintComplete }, ref) => {
    const [printed, setPrinted] = useState(false);

    // Function to get the current date and time in a formatted string.
    const getCurrentDateTime = () => {
        const options = {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        };
        return new Date().toLocaleString("en-GB", options);
    };

    // Define inline styles for the receipt for consistent rendering.
    const styles = {
        container: {
            fontFamily: "'Courier New', Courier, monospace", // Use a monospaced font for better alignment
            width: "72mm",
            margin: "auto",
            padding: "10px",
            fontSize: "12px",
            color: "#000",
            backgroundColor: "#fff",
        },
        header: {
            textAlign: "center",
            marginBottom: "10px",
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
        },
        tableHeaderCell: {
            textAlign: "left",
            padding: "2px 0",
            borderBottom: "1px dashed #000",
            fontWeight: "bold",
        },
        tableDataCell: {
            textAlign: "left",
            padding: "2px 0",
        },
        tableCellRight: {
            textAlign: "right",
            padding: "2px 0",
        },
        dashedLine: {
            margin: "8px 0",
            borderTop: "1px dashed #000",
        },
        footer: {
            textAlign: "center",
            marginTop: "10px",
        },
        companyName: {
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "2px",
        },
        infoText: {
            fontSize: "12px",
            margin: "2px 0",
        },
        largeBoldText: {
            fontSize: "14px",
            margin: "4px 0",
            fontWeight: "bold",
        },
        normalText: {
            fontSize: "12px",
            margin: "2px 0",
            textAlign: "left",
        },
        orderMethodText: {
            fontSize: "14px",
            fontStyle: "italic",
            fontWeight: "bold",
            marginTop: "10px",
        },
        totalLine: {
            fontWeight: "bold",
            fontSize: "14px",
        },
    };

    // useEffect hook to trigger printing when the component mounts.
    useEffect(() => {
        const printReceipt = () => {
            if (!ref.current || printed) return;
            setPrinted(true);

            const iframe = document.createElement("iframe");
            iframe.style.position = "absolute";
            iframe.style.top = "-10000px";
            document.body.appendChild(iframe);

            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            if (!doc) {
                console.error("Could not get iframe document for printing.");
                return;
            }

            doc.open();
            doc.write(`
                <html>
                    <head>
                        <title>Invoice</title>
                        <style>
                            @media print {
                                @page { margin: 0; size: 72mm auto; }
                                body { margin: 0; font-family: 'Courier New', Courier, monospace; }
                            }
                        </style>
                    </head>
                    <body>
                        ${ref.current.outerHTML}
                    </body>
                </html>
            `);
            doc.close();

            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();

            // Cleanup after a delay
            setTimeout(() => {
                document.body.removeChild(iframe);
                if (onPrintComplete) {
                    onPrintComplete();
                }
            }, 500);
        };

        if (invoiceData && !printed) {
            printReceipt();
        }
    }, [invoiceData, printed, onPrintComplete, ref]);

    if (!profileData || !invoiceData) {
        return <p>Loading invoice...</p>;
    }

    return (
        <div ref={ref} style={styles.container}>
            {/* Header Section */}
            <div style={styles.header}>
                <h2 style={styles.companyName}>{profileData?.name || "Restaurant Name"}</h2>
                <p style={styles.infoText}>{profileData?.address || "Restaurant Address"}</p>
                <p style={styles.infoText}>Contact: {profileData?.phone || "N/A"}</p>
                <p style={styles.infoText}>Bin No: {profileData?.binNumber || "N/A"} &nbsp;Mushak-6.3</p>
            </div>

            <div style={styles.dashedLine}></div>

            {/* Invoice Info Section */}
            <div>
                <p style={styles.normalText}><strong>Invoice:</strong> {invoiceData?.invoiceSerial || "N/A"}</p>
                <p style={styles.normalText}><strong>Date:</strong> {new Date(invoiceData?.dateTime).toLocaleString("en-GB")}</p>
                <p style={styles.normalText}><strong>Served By:</strong> {invoiceData?.loginUserName || "Staff"}</p>
                {invoiceData?.orderType === "dine-in" && invoiceData?.tableName && (
                    <p style={styles.normalText}><strong>Table:</strong> {invoiceData.tableName}</p>
                )}
                <p style={styles.normalText}><strong>Customer:</strong> {invoiceData?.customerName || "Guest"}</p>
            </div>

            <div style={styles.dashedLine}></div>

            {/* Items Table */}
            {Array.isArray(invoiceData?.products) && invoiceData.products.length > 0 ? (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.tableHeaderCell}>Item</th>
                            <th style={{...styles.tableHeaderCell, ...styles.tableCellRight}}>Qty</th>
                            <th style={{...styles.tableHeaderCell, ...styles.tableCellRight}}>Price</th>
                            <th style={{...styles.tableHeaderCell, ...styles.tableCellRight}}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoiceData.products.map((item, index) => (
                            <tr key={index}>
                                <td style={styles.tableDataCell}>{item.productName || "Unknown"}</td>
                                <td style={styles.tableCellRight}>{item.qty || 0}</td>
                                <td style={styles.tableCellRight}>{(item.rate || 0).toFixed(2)}</td>
                                <td style={styles.tableCellRight}>
                                    {item.isComplimentary ? "FREE" : (item.subtotal || 0).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p style={{ textAlign: "center" }}>No items to display.</p>
            )}
            
            <div style={styles.dashedLine}></div>

            {/* Total Section */}
            <div style={{ textAlign: "right" }}>
                <p style={styles.infoText}>Subtotal: ৳ {invoiceData.subtotal?.toFixed(2) || '0.00'}</p>
                
                {invoiceData?.vat > 0 && (
                    <p style={styles.infoText}>VAT: ৳ {invoiceData.vat.toFixed(2)}</p>
                )}

                {/* UPDATED: Display SD if it exists */}
                {invoiceData?.sd > 0 && (
                    <p style={styles.infoText}>SD: ৳ {invoiceData.sd.toFixed(2)}</p>
                )}

                {invoiceData?.discount > 0 && (
                    <p style={styles.infoText}>Discount: ৳ {invoiceData.discount.toFixed(2)}</p>
                )}
                <p style={styles.totalLine}>
                    Total: ৳ {(invoiceData?.totalAmount || 0).toFixed(2)}
                </p>
            </div>

            <div style={styles.dashedLine}></div>

            {/* Order Method */}
            <div style={{ textAlign: "center" }}>
                <p style={styles.orderMethodText}>
                    Order Type: {invoiceData?.orderType || "N/A"}
                </p>
            </div>

            {/* Footer Section */}
            <div style={styles.footer}>
                <p style={styles.infoText}>Thank you for your visit!</p>
                <p style={styles.infoText}>{profileData?.website || "www.your-website.com"}</p>
                <p style={{ fontSize: "10px", marginTop: "5px" }}>
                    Printed On: {getCurrentDateTime()}
                </p>
            </div>
        </div>
    );
});

ReceiptTemplate.displayName = 'ReceiptTemplate'; // Add display name for easier debugging

export default ReceiptTemplate;