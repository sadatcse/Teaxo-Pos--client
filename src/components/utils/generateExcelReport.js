import * as XLSX from 'xlsx';
import moment from 'moment';

export const generateExcel = (reportData) => {
    const { orders, summary, company, date } = reportData;

    // --- SHEET 1: SUMMARY ---
    const netSales = summary.totalAmount || 0;
    const grossSales = netSales + (summary.totalDiscount || 0);
    const avgPerPerson = summary.totalGuestCount > 0 ? netSales / summary.totalGuestCount : 0;

    const summaryData = [
        ["Report For", company.name],
        ["Date", moment(date).format("MMMM Do, YYYY")],
        [],
        ["SALES OVERVIEW", ""],
        ["Net Sales", netSales],
        ["Gross Sales", grossSales],
        ["Total Discount", summary.totalDiscount],
        ["Table Discount", summary.totalTableDiscount],
        ["Complimentary", summary.totalComplimentaryAmount],
        ["Total VAT", summary.totalVat],
        ["Total SD", summary.totalSd],
        [],
        ["COLLECTIONS", ""],
        ["Cash", summary.cashPayments],
        ["Card", summary.cardPayments],
        ["Mobile Banking", summary.mobilePayments],
        ["Bank", summary.bankPayments],
        [],
        ["ORDER TYPES", ""],
        ["Dine-In", summary.salesByOrderType?.['dine-in'] || 0],
        ["Takeaway", summary.salesByOrderType?.takeaway || 0],
        ["Delivery", summary.salesByOrderType?.delivery || 0],
        [],
        ["GUEST INFO", ""],
        ["Total Guests", summary.totalGuestCount],
        ["Avg Per Person", avgPerPerson],
    ];
    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWorksheet['!cols'] = [{ wch: 20 }, { wch: 20 }]; // Set column widths

    // --- SHEET 2: DETAILED ORDERS ---
    const ordersData = orders.map(order => ({
        "Invoice ID": order.invoiceSerial,
        "Time": moment(order.dateTime).format('h:mm A'),
        "Order Type": order.orderType,
        "Table/Provider": order.tableName || order.deliveryProvider || "N/A",
        "Customer Name": order.customerName,
        "Products": order.products.map(p => `${p.productName} (x${p.qty})`).join(', '),
        "Discount": order.discount,
        "VAT": order.vat,
        "SD": order.sd,
        "Total Amount": order.totalAmount,
        "Payment Method": order.paymentMethod,
    }));
    const ordersWorksheet = XLSX.utils.json_to_sheet(ordersData);
    ordersWorksheet['!cols'] = [ { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 50 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 15 } ];

    // --- SHEET 3: ITEMIZED SALES ---
    const itemizedData = [];
    orders.forEach(order => {
        order.products.forEach(product => {
            itemizedData.push({
                "Invoice ID": order.invoiceSerial,
                "Time": moment(order.dateTime).format('h:mm A'),
                "Product Name": product.productName,
                "Quantity": product.qty,
                "Rate": product.rate,
                "Subtotal": product.subtotal,
            });
        });
    });
    const itemizedWorksheet = XLSX.utils.json_to_sheet(itemizedData);
    itemizedWorksheet['!cols'] = [ { wch: 20 }, { wch: 15 }, { wch: 30 }, { wch: 10 }, { wch: 15 }, { wch: 15 } ];

    // --- CREATE WORKBOOK AND EXPORT ---
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");
    XLSX.utils.book_append_sheet(workbook, ordersWorksheet, "Detailed Orders");
    XLSX.utils.book_append_sheet(workbook, itemizedWorksheet, "Itemized Sales");

    XLSX.writeFile(workbook, `SalesReport_${moment(date).format('YYYY-MM-DD')}.xlsx`);
};