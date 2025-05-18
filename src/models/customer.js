const { SheetsHelper, SHEETS } = require('../config/sheets');

class Customer {
  static async getAll() {
    return SheetsHelper.getRows(SHEETS.CUSTOMERS);
  }
  
  static async getById(id) {
    const customers = await SheetsHelper.getRows(SHEETS.CUSTOMERS);
    return customers.find(customer => customer.ID === id) || null;
  }
  
  static async create(customerData) {
    const id = SheetsHelper.generateId();
    const timestamp = new Date().toISOString();
    
    const newCustomer = {
      ID: id,
      Name: customerData.name || '',
      Email: customerData.email || '',
      Phone: customerData.phone || '',
      Address: customerData.address || '',
      FacebookID: customerData.facebook_id || '',
      Notes: customerData.notes || '',
      CreatedAt: timestamp
    };
    
    await SheetsHelper.appendRow(SHEETS.CUSTOMERS, newCustomer);
    return { id };
  }
  
  static async update(id, customerData) {
    const updatedCustomer = {
      ID: id,
      Name: customerData.name,
      Email: customerData.email,
      Phone: customerData.phone,
      Address: customerData.address,
      FacebookID: customerData.facebook_id,
      Notes: customerData.notes
    };
    
    await SheetsHelper.updateRow(SHEETS.CUSTOMERS, id, updatedCustomer);
    return { success: true };
  }
  
  static async delete(id) {
    await SheetsHelper.deleteRow(SHEETS.CUSTOMERS, id);
    return { success: true };
  }
}

module.exports = Customer;