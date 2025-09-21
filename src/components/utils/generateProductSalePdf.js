import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';

export const generateProductSalePdf = (reportData) => {
    const { data, company, filters } = reportData;

    if (!data || !company || !filters) {
        console.error("Missing data for PDF generation.");
        alert("Could not generate PDF: Essential data is missing.");
        return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. HEADER
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(company.name, pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Product Sales Report", pageWidth / 2, 28, { align: 'center' });
    doc.setFontSize(10);
    const dateRange = `Date Range: ${moment(filters.startDate).format("MMM Do, YYYY")} to ${moment(filters.endDate).format("MMM Do, YYYY")}`;
    doc.text(dateRange, pageWidth / 2, 34, { align: 'center' });

    // 2. DETAILED PRODUCTS TABLE
    const tableColumn = ["#", "Product Name", "Rate", "Total Quantity Sold"];
    const tableRows = data.map((item, index) => [
        index + 1,
        item.productName,
        `${item.rate.toFixed(2)} TK`,
        item.qty,
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }, // Blue Header
        columnStyles: {
            2: { halign: 'right' },
            3: { halign: 'center' },
        }
    });
    
    // 3. FOOTER
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10);
        doc.text(`Report Generated: ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.getHeight() - 10);
    }

    // Save the PDF
    doc.save(`Product_Sales_Report_${moment(filters.startDate).format('YYYY-MM-DD')}.pdf`);
};