import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';

export const generatePdf = (reportData) => {
    const { invoices, summary, company, filters } = reportData;
    if (!summary || !company) {
        console.error("Missing data for PDF generation.");
        alert("Could not generate PDF: Essential data is missing.");
        return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let finalY = 0; // To keep track of the last table's position

    // 1. HEADER
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(company.name, pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Custom Sales Report", pageWidth / 2, 28, { align: 'center' });
    doc.setFontSize(10);
    const dateRange = `${moment(filters.startDate).format("MMM Do, YYYY")} to ${moment(filters.endDate).format("MMM Do, YYYY")}`;
    doc.text(dateRange, pageWidth / 2, 34, { align: 'center' });

    // 2. MAIN SUMMARY SECTION
    const totalSales = summary.totalSales || {};
    const taxes = summary.taxesAndDiscounts || {};
    const comp = summary.complimentaryItems || {};

    const mainSummaryBody = [
        ['Total Net Sales', `  ${(totalSales.totalAmount || 0).toFixed(2)}`],
        ['Average Order Value', `  ${(totalSales.averageOrderValue || 0).toFixed(2)}`],
        ['Total Discount', `-   ${(taxes.totalDiscount || 0).toFixed(2)}`],
        ['Total VAT', `  ${(taxes.totalVat || 0).toFixed(2)}`],
        ['Total SD', `  ${(taxes.totalSd || 0).toFixed(2)}`],
        ['Complimentary Value', `  ${(comp.totalComplimentaryAmount || 0).toFixed(2)}`],
    ];

    autoTable(doc, {
        startY: 45,
        head: [['Key Metrics', 'Value']],
        body: mainSummaryBody,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
    });
    finalY = doc.lastAutoTable.finalY + 10;

    // 3. SALES BY ORDER TYPE & PAYMENT METHOD
    const sbo = summary.salesByOrderType || {};
    const sbp = summary.salesByPaymentMethod || {};

    const orderTypeBody = Object.keys(sbo).map(key => [
        key.charAt(0).toUpperCase() + key.slice(1),
        sbo[key].invoiceCount,
        `  ${(sbo[key].totalAmount || 0).toFixed(2)}`
    ]);

    autoTable(doc, {
        startY: finalY,
        head: [['Order Type', 'Invoices', 'Total Amount']],
        body: orderTypeBody,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
    });
    finalY = doc.lastAutoTable.finalY + 10;

    const paymentMethodBody = Object.keys(sbp).map(key => [
        key.charAt(0).toUpperCase() + key.slice(1),
        sbp[key].invoiceCount,
        `  ${(sbp[key].totalAmount || 0).toFixed(2)}`
    ]);

    autoTable(doc, {
        startY: finalY,
        head: [['Payment Method', 'Invoices', 'Total Amount']],
        body: paymentMethodBody,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
    });
    finalY = doc.lastAutoTable.finalY + 10;


    // 4. DETAILED INVOICES TABLE
    const tableColumn = ["#", "Time", "Invoice ID", "User", "Type", "Payment", "Total"];
    const tableRows = invoices.map((invoice, index) => [
        index + 1,
        moment(invoice.dateTime).format('h:mm A'),
        invoice.invoiceSerial,
        invoice.loginUserName,
        invoice.orderType,
        invoice.paymentMethod,
        `  ${invoice.totalAmount.toFixed(2)}`
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: finalY,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
    });
    
    // 5. FOOTER
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10);
        doc.text(`Report Generated: ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.getHeight() - 10);
    }

    doc.save(`CustomReport_${moment(filters.startDate).format('YYYY-MM-DD')}_to_${moment(filters.endDate).format('YYYY-MM-DD')}.pdf`);
};