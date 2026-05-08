const generateInvoiceNumber = (lastNumber = 0) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const dateString = `${year}${month}${day}`;
    const increment = String(lastNumber + 1).padStart(4, '0');

    return `GRS/${dateString}/${increment}`;
};

module.exports = { generateInvoiceNumber };