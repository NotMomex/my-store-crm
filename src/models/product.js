const { SheetsHelper, SHEETS } = require('../config/sheets');

class Product {
  static async getAll() {
    try {
      return await SheetsHelper.getRows(SHEETS.PRODUCTS);
    } catch (error) {
      console.error('Error in Product.getAll():', error);
      throw error;
    }
  }
  
  static async getById(id) {
    try {
      const products = await SheetsHelper.getRows(SHEETS.PRODUCTS);
      return products.find(product => product.ID === id) || null;
    } catch (error) {
      console.error('Error in Product.getById():', error);
      throw error;
    }
  }
  
  static async create(productData) {
    try {
      const id = SheetsHelper.generateId();
      const timestamp = new Date().toISOString();
      
      const newProduct = {
        ID: id,
        Name: productData.name || '',
        Description: productData.description || '',
        Price: productData.price || '0',
        StockQuantity: productData.stock_quantity || '0',
        CreatedAt: timestamp
      };
      
      await SheetsHelper.appendRow(SHEETS.PRODUCTS, newProduct);
      return { id };
    } catch (error) {
      console.error('Error in Product.create():', error);
      throw error;
    }
  }
  
  static async update(id, productData) {
    try {
      const updatedProduct = {
        ID: id,
        Name: productData.name,
        Description: productData.description,
        Price: productData.price,
        StockQuantity: productData.stock_quantity
      };
      
      await SheetsHelper.updateRow(SHEETS.PRODUCTS, id, updatedProduct);
      return { success: true };
    } catch (error) {
      console.error('Error in Product.update():', error);
      throw error;
    }
  }
  
  static async delete(id) {
    try {
      await SheetsHelper.deleteRow(SHEETS.PRODUCTS, id);
      return { success: true };
    } catch (error) {
      console.error('Error in Product.delete():', error);
      throw error;
    }
  }
}

module.exports = Product;