import * as XLSX from 'xlsx';
import moment from 'moment';

export const generateExcel = (reportData) => {
    const { invoices, summary, company, filters } = reportData;
    
    // --- SHEET 1: SUMMARY ---
    const { totalSales, taxesAndDiscounts, salesByPaymentMethod, salesByOrderType, complimentaryItems } = summary;
    const grossSales = totalSales.totalAmount + taxesAndDiscounts.totalDiscount;

    const summaryData = [
        ["Report For", company.name],
        ["Date Range", `${moment(filters.startDate).format("MMM D, YYYY")} to ${moment(filters.endDate).format("MMM D, YYYY")}`],
        [],
        ["SALES OVERVIEW", ""],
        ["Net Sales", totalSales.totalAmount],
        ["Gross Sales", grossSales],
        ["Total Discount", taxesAndDiscounts.totalDiscount],
        ["Table Discount", taxesAndDiscounts.totalTableDiscount],
        ["Complimentary", complimentaryItems.totalComplimentaryAmount],
        ["Total VAT", taxesAndDiscounts.totalVat],
        ["Total SD", taxesAndDiscounts.totalSd],
        [],
        ["COLLECTIONS", ""],
        ...Object.entries(salesByPaymentMethod).map(([key, value]) => [`${key.charAt(0).toUpperCase() + key.slice(1)} (${value.invoiceCount})`, value.totalAmount]),
        [],
        ["ORDER TYPES", ""],
        ...Object.entries(salesByOrderType).map(([key, value]) => [`${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()} (${value.invoiceCount})`, value.totalAmount]),
    ];
    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 20 }];

    // --- SHEET 2: DETAILED INVOICES ---
    const invoicesData = invoices.map(invoice => ({
        "Invoice ID": invoice.invoiceSerial,
        "Date": moment(invoice.dateTime).format('YYYY-MM-DD'),
        "Time": moment(invoice.dateTime).format('h:mm A'),
        "Order Type": invoice.orderType,
        "Order Status": invoice.orderStatus,
        "Table/Provider": invoice.tableName || invoice.deliveryProvider || "N/A",
        "Items": invoice.products.reduce((sum, p) => sum + p.qty, 0),
        "Staff": invoice.loginUserName,
        "Discount": invoice.discount,
        "VAT": invoice.vat,
        "SD": invoice.sd,
        "Total Amount": invoice.totalAmount,
        "Payment Method": invoice.paymentMethod,
    }));
    const invoicesWorksheet = XLSX.utils.json_to_sheet(invoicesData);
    invoicesWorksheet['!cols'] = [ { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 8 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 20 } ];

    // --- SHEET 3: ITEMIZED SALES ---
    const itemizedData = [];
    invoices.forEach(invoice => {
        invoice.products.forEach(product => {
            itemizedData.push({
                "Invoice ID": invoice.invoiceSerial,
                "Time": moment(invoice.dateTime).format('h:mm A'),
                "Product Name": product.productName,
                "Quantity": product.qty,
                "Rate": product.rate,
                "Subtotal": product.subtotal,
                "VAT": product.vat,
                "SD": product.sd,
                "Complimentary": product.isComplimentary ? "Yes" : "No",
            });
        });
    });
    const itemizedWorksheet = XLSX.utils.json_to_sheet(itemizedData);
    itemizedWorksheet['!cols'] = [ { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 15 } ];
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");
    XLSX.utils.book_append_sheet(workbook, invoicesWorksheet, "All Invoices");
    XLSX.utils.book_append_sheet(workbook, itemizedWorksheet, "Itemized Sales");

    XLSX.writeFile(workbook, `CustomReport_${moment(filters.startDate).format('YYYY-MM-DD')}_to_${moment(filters.endDate).format('YYYY-MM-DD')}.xlsx`);
};