import * as XLSX from 'xlsx';
import moment from 'moment';

export const generateProductSaleExcel = (reportData) => {
    const { data, company, filters } = reportData;

    if (!data || !company || !filters) {
        console.error("Missing data for Excel generation.");
        alert("Could not generate Excel: Essential data is missing.");
        return;
    }

    // --- SHEET 1: PRODUCT SALES ---
    const reportHeader = [
        ["Report For", company.name],
        ["Date Range", `${moment(filters.startDate).format("MMM D, YYYY")} to ${moment(filters.endDate).format("MMM D, YYYY")}`],
        ["Category Filter", filters.category],
        ["Product Filter", filters.product],
        [], // Empty row for spacing
    ];

    const salesData = data.map((item, index) => ({
        "SL.No": index + 1,
        "Product Name": item.productName,
        "Rate": item.rate,
        "Total Quantity Sold": item.qty,
    }));

    const worksheet = XLSX.utils.json_to_sheet(salesData);
    
    // Add the header to the top of the worksheet
    XLSX.utils.sheet_add_aoa(worksheet, reportHeader, { origin: "A1" });

    // Adjust column widths for better readability
    worksheet['!cols'] = [
        { wch: 8 },  // SL.No
        { wch: 40 }, // Product Name
        { wch: 15 }, // Rate
        { wch: 20 }, // Total Quantity Sold
    ];

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Product Sales");

    // Generate and download the Excel file
    XLSX.writeFile(workbook, `Product_Sales_Report_${moment(filters.startDate).format('YYYY-MM-DD')}.xlsx`);
};