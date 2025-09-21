import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Corrected import
import moment from 'moment';

export const generatePdf = (reportData) => {
    const { orders, summary, company, date } = reportData;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. HEADER
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(company.name, pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Daily Sales Summary", pageWidth / 2, 28, { align: 'center' });
    doc.setFontSize(10);
    doc.text(moment(date).format("MMMM Do, YYYY"), pageWidth / 2, 34, { align: 'center' });

    // 2. SUMMARY SECTION
    const summaryBody = [
        ['Net Sales', `৳${summary.totalAmount.toFixed(2)}`, 'Cash Collection', `৳${summary.cashPayments.toFixed(2)}`],
        ['Gross Sales', `৳${(summary.totalAmount + summary.totalDiscount).toFixed(2)}`, 'Card Collection', `৳${summary.cardPayments.toFixed(2)}`],
        ['Total Discount', `- ৳${summary.totalDiscount.toFixed(2)}`, 'Mobile Banking', `৳${summary.mobilePayments.toFixed(2)}`],
        ['Total VAT', `৳${summary.totalVat.toFixed(2)}`, 'Bank Collection', `৳${summary.bankPayments.toFixed(2)}`],
        ['Total SD', `৳${summary.totalSd.toFixed(2)}`, 'Total Guests', `${summary.totalGuestCount}`],
        ['Complimentary', `৳${summary.totalComplimentaryAmount.toFixed(2)}`, 'Avg Per Person', `৳${(summary.totalGuestCount > 0 ? summary.totalAmount / summary.totalGuestCount : 0).toFixed(2)}`],
    ];

    // Corrected function call for autoTable
    autoTable(doc, {
        startY: 45,
        body: summaryBody,
        theme: 'grid',
        styles: {
            fontSize: 9,
            cellPadding: 2,
        },
        columnStyles: {
            0: { fontStyle: 'bold' },
            2: { fontStyle: 'bold' },
        },
    });

    // 3. DETAILED ORDERS TABLE
    const tableColumn = ["#", "Time", "Invoice ID", "Type", "Items", "Payment", "Total"];
    const tableRows = [];

    orders.forEach((order, index) => {
        const orderData = [
            index + 1,
            moment(order.dateTime).format('h:mm A'),
            order.invoiceSerial,
            order.orderType,
            order.totalQty,
            order.paymentMethod,
            `৳${order.totalAmount.toFixed(2)}`
        ];
        tableRows.push(orderData);
    });

    // Corrected function call for the second autoTable
    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: doc.lastAutoTable.finalY + 10,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }, // Blue Header
    });
    
    // 4. FOOTER
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10);
        doc.text(`Report Generated: ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.getHeight() - 10);
    }

    // Save the PDF
    doc.save(`SalesReport_${moment(date).format('YYYY-MM-DD')}.pdf`);
};