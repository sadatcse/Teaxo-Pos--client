import React, { forwardRef, useEffect, useState } from "react";

// ReceiptTemplate is a functional component that displays a detailed invoice receipt.
// It receives profileData (company info) and invoiceData (order details) as props.
// It's forwardRef'd to allow parent components to access its DOM node for potential printing.
// It also accepts an onPrintComplete prop to notify the parent when printing is done.
const ReceiptTemplate = forwardRef(({ profileData, invoiceData, onPrintComplete }, ref) => {
  const [printed, setPrinted] = useState(false); // Flag to prevent double printing

  // Function to get the current date and time in a formatted string.
  const getCurrentDateTime = () => {
    // Corrected format to match the image's "29 July 2025 at 12:09:38"
    const options = {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // Use 24-hour format
    };
    return new Date().toLocaleString("en-GB", options);
  };

  // Define inline styles for the receipt for consistent rendering.
  // Moved styles here as they are static and don't depend on props/state,
  // making them clearer to define once.
  const styles = {
    container: {
      fontFamily: "Arial, sans-serif",
      width: "72mm", // Standard thermal printer width
      margin: "auto",
      padding: "16px",
      fontSize: "12px",
      color: "#000",
      backgroundColor: "#fff",
      // height: "115mm" // Removed fixed height to allow content to dictate height
    },
    header: {
      textAlign: "center",
      marginBottom: "16px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "14px",
    },
    tableHeaderCell: {
        textAlign: "left",
        padding: "2px 0",
    },
    tableDataCell: {
        textAlign: "left",
        padding: "2px 0",
    },
    tableSubtotalCell: {
        textAlign: "right",
        padding: "2px 0",
    },
    dashedLine: {
      margin: "5px 0",
      borderTop: "1px dashed #000",
    },
    footer: {
      textAlign: "center",
      marginTop: "10px",
    },
    // Styles for specific text elements to increase font size
    companyName: {
      fontSize: "20px",
      fontWeight: "bold",
      marginBottom: "2px",
    },
    infoText: {
      fontSize: "14px",
      margin: 0,
    },
    largeBoldText: { // Used for Table name
      fontSize: "16px",
      margin: "4px 0",
      fontWeight: "bold",
    },
    normalText: { // Used for Customer, Invoice No, Date, Served By
      fontSize: "14px", // Changed from 12px to 14px to match image
      margin: "0", // Removed margin 4px 0 for tighter spacing
      textAlign: "center", // Explicitly centered as in image
    },
    orderMethodText: {
      fontSize: "16px",
      fontStyle: "italic",
      fontWeight: "bold",
      marginTop: "10px", // Added margin for separation
    },
    totalLine: {
        fontWeight: "bold",
        fontSize: "14px", // Adjusted to match image's total font size
    },
  };

  // useEffect hook to trigger printing when the component mounts.
  useEffect(() => {
    // Function to trigger the printing of the receipt.
    // Moved inside useEffect to resolve the lint warning
    const printReceipt = () => {
      // Prevent duplicate printing if already printed or ref is not available.
      if (!ref.current || printed) return;
      setPrinted(true); // Set printed flag to true to prevent re-printing

      // Create a hidden iframe to handle printing.
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.top = "-10000px"; // Position off-screen
      iframe.style.width = "1px"; // Minimal size
      iframe.style.height = "1px"; // Minimal size
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
            <title>Invoice</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: auto;
                padding: 0;
                width: 75mm; /* Standard thermal printer width */
                /* height: 115mm; Removed fixed height to allow content to dictate height */
                box-sizing: border-box; /* Include padding in width calculation */
              }
              .container {
                margin: auto;
                padding: 16px;
                font-size: 12px;
                color: #000;
                background-color: #fff;
                page-break-after: always; /* Ensures each receipt prints on a new page if multiple are ever generated */
              }
              .header {
                text-align: center;
                margin-bottom: 16px;
              }
              .table {
                width: 100%;
                border-collapse: collapse;
                font-size: 14px;
              }
              .table th, .table td {
                  padding: 2px 0; /* Adjusted padding for tighter spacing */
                  text-align: left;
              }
              .table th:nth-child(5), .table td:nth-child(5) {
                  text-align: right; /* Align Subtotal to the right */
              }
              .dashed-line {
                margin: 5px 0;
                border-top: 1px dashed #000;
              }
              .footer {
                text-align: center;
                margin-top: 10px;
              }
              /* Specific text styles for better matching the image */
              .company-name {
                  font-size: 20px;
                  font-weight: bold;
                  margin-bottom: 2px;
              }
              .info-text {
                  font-size: 14px;
                  margin: 0;
              }
              .large-bold-text {
                  font-size: 16px;
                  font-weight: bold;
                  margin: 4px 0;
              }
              .normal-text {
                  font-size: 12px;
                  margin: 4px 0;
              }
              .order-method-text {
                  font-size: 16px;
                  font-style: italic;
                  font-weight: bold;
              }
              .total-line {
                  font-weight: bold;
                  font-size: 14px; /* Adjust if needed */
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
      // Use a small delay to ensure print dialog has a chance to open
      iframe.contentWindow.onfocus = () => {
          setTimeout(() => {
              document.body.removeChild(iframe);
              if (onPrintComplete) {
                  onPrintComplete(); // Notify the parent component that printing is complete
              }
          }, 500); // 500ms delay
      };
    };

    // Only attempt to print if the invoiceData is available and it hasn't been printed yet.
    if (invoiceData && !printed) {
      printReceipt();
    }
  }, [invoiceData, printed, onPrintComplete, ref]); // Dependencies for useEffect. Now 'printReceipt' is not a dependency itself.

  // Display a loading message if essential data is not yet available.
  if (!profileData || !invoiceData) {
    return <p>Loading invoice...</p>;
  }

  return (
    // The ref is attached to the main container div to allow parent components to reference this element.
    <div ref={ref} style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <h2 style={styles.companyName}>
          {profileData?.name || "Restaurant Name"}
        </h2>
        <p style={styles.infoText}>
          {profileData?.address || "Restaurant Address"}
        </p>
        <p style={styles.infoText}>
          Contact: {profileData?.phone || "No Contact Info"}
        </p>
        <p style={styles.infoText}>
          Bin No: {profileData?.binNumber || "No Contact Info"} &nbsp;Mushak -6.3 {/* Added non-breaking space */}
        </p>
        <hr style={styles.dashedLine} />

        {/* Conditional rendering for Table Name (only for dine-in) */}
        {invoiceData?.orderType === "dine-in" && invoiceData?.tableName && (
          <p style={styles.largeBoldText}>
            Table: {invoiceData.tableName}
          </p>
        )}
        {/* Customer Info */}
        <p style={styles.normalText}> {/* Changed to normalText style */}
          Customer: {invoiceData?.customerName && invoiceData.customerName.trim().toLowerCase() !== "unknown" ? invoiceData.customerName : "Guest"}
        </p>

        <hr style={styles.dashedLine} />
      </div>

      {/* Invoice Info Section */}
      <div>
        <p style={styles.normalText}> {/* Changed to normalText style and explicitly centered */}
          Invoice No: {invoiceData?.invoiceSerial || "Unknown"}
        </p>
        <p style={styles.normalText}> {/* Changed to normalText style and explicitly centered */}
          Date:{" "}
          {new Date(invoiceData?.dateTime).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
        <p style={styles.normalText}> {/* Changed to normalText style and explicitly centered */}
          Served By: {invoiceData?.loginUserName || "Staff"}
        </p>
        <hr style={styles.dashedLine} />
      </div>

      {/* Items Table */}
      {Array.isArray(invoiceData?.products) && invoiceData.products.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeaderCell}>#</th>
              <th style={styles.tableHeaderCell}>Item</th>
              <th style={styles.tableHeaderCell}>Qty</th>
              <th style={styles.tableHeaderCell}>Rate</th>
              <th style={styles.tableSubtotalCell}>Subtotal</th> {/* Align header to right */}
            </tr>
          </thead>
          <tbody>
            {invoiceData.products.map((item, index) => (
              <tr key={index}>
                <td style={styles.tableDataCell}>{index + 1}</td>
                <td style={styles.tableDataCell}>{item.productName || "Unknown Item"}</td>
                <td style={styles.tableDataCell}>{item.qty || 0}</td>
                <td style={styles.tableDataCell}>৳ {item.rate || 0}</td>
                           <td style={styles.tableSubtotalCell}>
                  {item.isComplimentary ? "FREE" : `৳ ${item.subtotal || 0}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ textAlign: "center" }}>No items to display.</p>
      )}
      <hr style={styles.dashedLine} />

      {/* Total Section */}
      <div style={{ textAlign: "right" }}>
        {/* Removed explicit subtotal line as per image */}
        {invoiceData?.vat > 0 && <p style={{margin: '4px 0'}}>Vat: ৳ {invoiceData.vat}</p>}

        {/* Display Discount only if it's greater than 0, as in the image */}
        {invoiceData?.discount > 0 && (
          <p style={{margin: '4px 0'}}>Discount: ৳ {invoiceData?.discount}</p>
        )}
        <p style={styles.totalLine}>
          Total: ৳ {(invoiceData?.totalAmount || 0)}
        </p>
      </div>
      <hr style={styles.dashedLine} />

      {/* Order Method */}
      <div style={{ textAlign: "center" }}>
        <p style={styles.orderMethodText}> {/* Applied the new style here */}
          Order Method: {invoiceData?.orderType || "Unknown"}
        </p>
      </div>


      {/* Footer Section */}
      <div style={styles.footer}>
        {invoiceData?.vat === 0 && (
          <p style={{margin: '4px 0'}}>*VAT not collected on certain items*</p>
        )}

        <p style={{margin: '4px 0'}}>Thank you for dining with us!</p>
        <p style={{margin: '4px 0'}}>{profileData?.website || "www.sadatkhan.com"}</p>
        <p style={{ fontSize: "10px", marginTop: "5px" }}>
          Printed On: {getCurrentDateTime()}
        </p>
      </div>
      <div style={{ pageBreakAfter: "always" }}></div>
    </div>
  );
});

export default ReceiptTemplate;