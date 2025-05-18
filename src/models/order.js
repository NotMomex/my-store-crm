const { SheetsHelper, SHEETS } = require('../config/sheets');
const Customer = require('./customer');

class Order {
  static async getAll() {
    const orders = await SheetsHelper.getRows(SHEETS.ORDERS);
    const customers = await SheetsHelper.getRows(SHEETS.CUSTOMERS);
    
    // Join orders with customer names
    return orders.map(order => {
      const customer = customers.find(c => c.ID === order.CustomerID) || {};
      return {
        ...order,
        customer_name: customer.Name || 'Unknown'
      };
    });
  }
  
  static async getById(id) {
    const orders = await SheetsHelper.getRows(SHEETS.ORDERS);
    const order = orders.find(order => order.ID === id);
    
    if (!order) {
      return null;
    }
    
    // Get customer details
    const customer = await Customer.getById(order.CustomerID);
    
    // Get order items
    const allOrderItems = await SheetsHelper.getRows(SHEETS.ORDER_ITEMS);
    const orderItems = allOrderItems.filter(item => item.OrderID === id);
    
    // Get product details for each order item
    const products = await SheetsHelper.getRows(SHEETS.PRODUCTS);
    const itemsWithProductDetails = orderItems.map(item => {
      const product = products.find(p => p.ID === item.ProductID) || {};
      return {
        ...item,
        product_name: product.Name || 'Unknown Product'
      };
    });
    
    return {
      ...order,
      customer_name: customer ? customer.Name : 'Unknown',
      customer_phone: customer ? customer.Phone : '',
      customer_address: customer ? customer.Address : '',
      items: itemsWithProductDetails
    };
  }
  
  static async create(orderData) {
    const id = SheetsHelper.generateId();
    const timestamp = new Date().toISOString();
    
    const newOrder = {
      ID: id,
      CustomerID: orderData.customer_id,
      OrderDate: timestamp,
      Status: orderData.status || 'pending',
      DeliveryFee: orderData.delivery_fee || '0',
      TotalAmount: orderData.total_amount || '0',
      AmountCollected: orderData.amount_collected || '0',
      DeliveryDate: orderData.delivery_date || '',
      PaymentStatus: orderData.payment_status || 'unpaid',
      Notes: orderData.notes || '',
      CreatedAt: timestamp
    };
    
    await SheetsHelper.appendRow(SHEETS.ORDERS, newOrder);
    return { id };
  }
  
  static async addOrderItem(orderItem) {
    const id = SheetsHelper.generateId();
    const timestamp = new Date().toISOString();
    
    const newOrderItem = {
      ID: id,
      OrderID: orderItem.order_id,
      ProductID: orderItem.product_id,
      Quantity: orderItem.quantity || '1',
      Price: orderItem.price || '0',
      CreatedAt: timestamp
    };
    
    await SheetsHelper.appendRow(SHEETS.ORDER_ITEMS, newOrderItem);
    return { id };
  }
  
  static async updateStatus(id, status) {
    await SheetsHelper.updateRow(SHEETS.ORDERS, id, { Status: status });
    return { success: true };
  }
  
  static async updatePayment(id, amount_collected, payment_status) {
    await SheetsHelper.updateRow(SHEETS.ORDERS, id, { 
      AmountCollected: amount_collected,
      PaymentStatus: payment_status
    });
    return { success: true };
  }
  
  static async delete(id) {
    // Delete order items first
    const orderItems = await SheetsHelper.getRows(SHEETS.ORDER_ITEMS);
    const itemsToDelete = orderItems.filter(item => item.OrderID === id);
    
    for (const item of itemsToDelete) {
      await SheetsHelper.deleteRow(SHEETS.ORDER_ITEMS, item.ID);
    }
    
    // Then delete the order
    await SheetsHelper.deleteRow(SHEETS.ORDERS, id);
    return { success: true };
  }
  
  static async getWeeklySales() {
    const orders = await SheetsHelper.getRows(SHEETS.ORDERS);
    
    // Group orders by week
    const weeklySales = {};
    
    orders.forEach(order => {
      const orderDate = new Date(order.OrderDate);
      if (!isNaN(orderDate.getTime())) {
        // Get year and week number
        const year = orderDate.getFullYear();
        const weekNumber = getWeekNumber(orderDate);
        const weekKey = `${year}-${weekNumber}`;
        
        if (!weeklySales[weekKey]) {
          weeklySales[weekKey] = {
            week: weekKey,
            total_sales: 0,
            order_count: 0
          };
        }
        
        weeklySales[weekKey].total_sales += parseFloat(order.TotalAmount) || 0;
        weeklySales[weekKey].order_count += 1;
      }
    });
    
    // Convert to array and sort by week
    return Object.values(weeklySales).sort((a, b) => b.week.localeCompare(a.week));
  }
}

// Helper function to get week number
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo.toString().padStart(2, '0');
}

module.exports = Order;