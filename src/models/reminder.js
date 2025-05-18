const { SheetsHelper, SHEETS } = require('../config/sheets');

class Reminder {
  static async getAll() {
    const reminders = await SheetsHelper.getRows(SHEETS.REMINDERS);
    const orders = await SheetsHelper.getRows(SHEETS.ORDERS);
    const customers = await SheetsHelper.getRows(SHEETS.CUSTOMERS);
    
    // Join reminders with order and customer info
    return reminders.map(reminder => {
      const order = orders.find(o => o.ID === reminder.OrderID) || {};
      const customer = customers.find(c => c.ID === order.CustomerID) || {};
      
      return {
        ...reminder,
        order_id: reminder.OrderID,
        customer_name: customer.Name || 'Unknown',
        customer_phone: customer.Phone || ''
      };
    });
  }
  
  static async getPending() {
    const allReminders = await this.getAll();
    return allReminders.filter(reminder => reminder.Status === 'pending');
  }
  
  static async create(reminderData) {
    const id = SheetsHelper.generateId();
    const timestamp = new Date().toISOString();
    
    const newReminder = {
      ID: id,
      OrderID: reminderData.order_id,
      ReminderType: reminderData.reminder_type || 'payment',
      DueDate: reminderData.due_date || timestamp.split('T')[0],
      Amount: reminderData.amount || '0',
      Status: 'pending',
      Notes: reminderData.notes || '',
      CreatedAt: timestamp
    };
    
    await SheetsHelper.appendRow(SHEETS.REMINDERS, newReminder);
    return { id };
  }
  
  static async updateStatus(id, status) {
    await SheetsHelper.updateRow(SHEETS.REMINDERS, id, { Status: status });
    return { success: true };
  }
  
  static async delete(id) {
    await SheetsHelper.deleteRow(SHEETS.REMINDERS, id);
    return { success: true };
  }
}

module.exports = Reminder;