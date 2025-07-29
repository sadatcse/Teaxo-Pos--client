import React, { forwardRef, useEffect, useState } from "react";

// KitchenReceiptTemplate is a functional component that displays a simplified receipt for kitchen staff.
// It receives profileData (company info) and invoiceData (order details) as props.
// It's forwardRef'd to allow parent components to access its DOM node for potential printing.
// It also accepts an onPrintComplete prop to notify the parent when printing is done.
const KitchenReceiptTemplate = forwardRef(({ profileData, invoiceData, onPrintComplete }, ref) => {
  const [printed, setPrinted] = useState(false); // Flag to prevent double printing

  // Function to get the current date and time in a formatted string.
  const getCurrentDateTime = () => {
    return new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Function to trigger the printing of the receipt.
  const printReceipt = () => {
    // Prevent duplicate printing if already printed or ref is not available.
    if (!ref.current || printed) return;
    setPrinted(true); // Set printed flag to true to prevent re-printing

    // Create a hidden iframe to handle printing.
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.top = "-10000px"; // Position off-screen
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
        console.error("Could not get iframe document for printing.");
        return;
    }

    doc.open();
    // Write the HTML content of the component to the iframe for printing.
    doc.write(`
      <html>
        <head>
          <title>Kitchen Order Ticket</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: auto;
              padding: 0;
              width: 75mm; /* Standard thermal printer width */
            }
            .container {
              margin: auto;
              padding: 16px;
              font-size: 14px; /* Increased base font size */
              color: #000;
              background-color: #fff;
              page-break-after: always; /* Ensures each KOT prints on a new page if multiple are ever generated */
            }
            .header {
              text-align: center;
              margin-bottom: 16px;
            }
            .header h2 {
              font-size: 24px; /* Increased header font size */
              font-weight: bold;
              margin-bottom: 2px;
            }
            .header p {
              font-size: 16px; /* Increased paragraph font size in header */
              margin: 0;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              font-size: 16px; /* Increased table font size */
            }
            .dashed-line {
              margin: 5px 0;
              border-top: 1px dashed #000;
            }
            .footer {
              text-align: center;
              margin-top: 10px;
            }
            .footer p {
              font-size: 12px; /* Increased footer font size */
            }
          </style>
        </head>
        <body>
          ${ref.current.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    // Focus the iframe and trigger the print dialog.
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();

    // Clean up the iframe after printing is complete.
    iframe.onload = () => {
      document.body.removeChild(iframe);
      if (onPrintComplete) {
        onPrintComplete(); // Notify the parent component that printing is complete
      }
    };
  };

  // useEffect hook to trigger printing when the component mounts.
  useEffect(() => {
    // Only attempt to print if the invoiceData is available and it hasn't been printed yet.
    if (invoiceData && !printed) {
      printReceipt();
    }
  }, [invoiceData, printed]); // Dependencies ensure this runs when invoiceData changes or printed status is reset.

  // Define inline styles for the receipt for consistent rendering.
  const styles = {
    container: {
      fontFamily: "Arial, sans-serif",
      width: "72mm", // Standard thermal printer width
      margin: "auto",
      padding: "16px",
      fontSize: "14px", // Increased base font size
      color: "#000",
      backgroundColor: "#fff",
    },
    header: {
      textAlign: "center",
      marginBottom: "16px",
    },
    h2: { // Added specific style for h2
      fontSize: "24px", // Increased header font size
      fontWeight: "bold",
      marginBottom: "2px",
    },
    pHeader: { // Added specific style for paragraphs in header
      fontSize: "16px", // Increased paragraph font size in header
      margin: 0,
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "16px", // Increased table font size
    },
    dashedLine: {
      margin: "5px 0",
      borderTop: "1px dashed #000",
    },
    footer: {
      textAlign: "center",
      marginTop: "10px",
    },
    pFooter: { // Added specific style for paragraphs in footer
      fontSize: "12px", // Increased footer font size
      marginTop: "5px",
    }
  };

  // Display a loading message if essential data is not yet available.
  if (!profileData || !invoiceData) {
    return <p>Loading kitchen order...</p>;
  }

  return (
    // The ref is attached to the main container div to allow parent components to reference this element.
    <div ref={ref} style={styles.container}>
      {/* Header Section for Kitchen */}
      <div style={styles.header}>
        <h2 style={styles.h2}>
          {profileData?.name || "Restaurant Name"}
        </h2>
        <p style={styles.pHeader}>
          Kitchen Order Ticket (KOT)
        </p>
        <hr style={styles.dashedLine} />

        {/* Display Order Type and Table Name/Delivery Provider */}
        <p style={styles.pHeader}>
          Order Type: {invoiceData?.orderType || "Unknown"}
        </p>
        {invoiceData?.orderType === "dine-in" && invoiceData?.tableName && (
          <p style={styles.pHeader}>
            Table: {invoiceData.tableName}
          </p>
        )}
        {invoiceData?.orderType === "delivery" && invoiceData?.deliveryProvider && (
          <p style={styles.pHeader}>
            Delivery By: {invoiceData.deliveryProvider}
          </p>
        )}
        <p style={styles.pHeader}>
          Order ID: {invoiceData?.invoiceSerial || "N/A"}
        </p>
        <p style={styles.pHeader}>
          Time: {getCurrentDateTime()}
        </p>
        <hr style={styles.dashedLine} />
      </div>

      {/* Items Table - Focus on Product Name and Quantity */}
      {Array.isArray(invoiceData?.products) && invoiceData.products.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Qty</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.products.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.productName || "Unknown Item"}</td>
                <td>{item.qty || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ textAlign: "center" }}>No items to display.</p>
      )}
      <hr style={styles.dashedLine} />

      {/* Footer Section for Kitchen */}
      <div style={styles.footer}>
        <p style={{ fontWeight: "bold", fontSize: "16px" }}>-- End of Order --</p> {/* Increased font size here */}
        <p style={styles.pFooter}>
          Prepared by: {invoiceData?.loginUserName || "Staff"}
        </p>
      </div>
    </div>
  );
});

export default KitchenReceiptTemplate;
