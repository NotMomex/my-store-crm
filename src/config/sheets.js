const { google } = require('googleapis');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

// Sheet names
const SHEETS = {
  CUSTOMERS: 'Customers',
  PRODUCTS: 'Products',
  ORDERS: 'Orders',
  ORDER_ITEMS: 'OrderItems',
  REMINDERS: 'Reminders'
};

class SheetsHelper {
  static async getAuthClient() {
    // Path to the credentials file
    const CREDENTIALS_PATH = path.join(__dirname, 'credentials', 'google-credentials.json');
    
    // Create a new JWT client using the credentials
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    return auth.getClient();
  }
  
  static async getRows(sheetName) {
    try {
      const authClient = await this.getAuthClient();
      const sheets = google.sheets({ version: 'v4', auth: authClient });
      
      // Spreadsheet ID from .env file
      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
      
      // Use proper range notation: SheetName!A:Z
      const range = `${sheetName}!A:Z`;
      
      console.log(`Getting rows from ${range}`);
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      
      const rows = response.data.values || [];
      
      // If there are no rows or only header row, return empty array
      if (rows.length <= 1) {
        return [];
      }
      
      // Extract headers from the first row
      const headers = rows[0];
      
      // Map the remaining rows to objects using the headers
      return rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });
    } catch (error) {
      console.error(`Error getting rows from ${sheetName}:`, error);
      throw error;
    }
  }
  
  static async appendRow(sheetName, data) {
    try {
      const authClient = await this.getAuthClient();
      const sheets = google.sheets({ version: 'v4', auth: authClient });
      
      // Spreadsheet ID from .env file
      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
      
      // Use proper range notation: SheetName!A:Z
      const range = `${sheetName}!A:Z`;
      
      // Get headers first
      const headersResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:Z1`,
      });
      
      const headers = headersResponse.data.values[0];
      
      // Create row values in the same order as headers
      const rowValues = headers.map(header => data[header] || '');
      
      // Append the row
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [rowValues],
        },
      });
      
      return { success: true };
    } catch (error) {
      console.error(`Error appending row to ${sheetName}:`, error);
      throw error;
    }
  }
  
  static async updateRow(sheetName, id, data) {
    try {
      const authClient = await this.getAuthClient();
      const sheets = google.sheets({ version: 'v4', auth: authClient });
      
      // Spreadsheet ID from .env file
      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
      
      // Get all rows to find the one with matching ID
      const rows = await this.getRows(sheetName);
      const rowIndex = rows.findIndex(row => row.ID === id);
      
      if (rowIndex === -1) {
        throw new Error(`Row with ID ${id} not found in ${sheetName}`);
      }
      
      // Get headers
      const headersResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:Z1`,
      });
      
      const headers = headersResponse.data.values[0];
      
      // Create row values in the same order as headers
      const rowValues = headers.map(header => data[header] || '');
      
      // Update the row (add 2 to rowIndex: 1 for 0-indexing to 1-indexing, 1 for header row)
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowIndex + 2}:${this.columnToLetter(headers.length)}${rowIndex + 2}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [rowValues],
        },
      });
      
      return { success: true };
    } catch (error) {
      console.error(`Error updating row in ${sheetName}:`, error);
      throw error;
    }
  }
  
  static async deleteRow(sheetName, id) {
    try {
      const authClient = await this.getAuthClient();
      const sheets = google.sheets({ version: 'v4', auth: authClient });
      
      // Spreadsheet ID from .env file
      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
      
      // Get all rows to find the one with matching ID
      const rows = await this.getRows(sheetName);
      const rowIndex = rows.findIndex(row => row.ID === id);
      
      if (rowIndex === -1) {
        throw new Error(`Row with ID ${id} not found in ${sheetName}`);
      }
      
      // Get sheet ID
      const sheetsResponse = await sheets.spreadsheets.get({
        spreadsheetId,
      });
      
      const sheet = sheetsResponse.data.sheets.find(s => s.properties.title === sheetName);
      
      if (!sheet) {
        throw new Error(`Sheet ${sheetName} not found`);
      }
      
      const sheetId = sheet.properties.sheetId;
      
      // Delete the row (add 2 to rowIndex: 1 for 0-indexing to 1-indexing, 1 for header row)
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId,
                  dimension: 'ROWS',
                  startIndex: rowIndex + 1, // +1 for header row
                  endIndex: rowIndex + 2,
                },
              },
            },
          ],
        },
      });
      
      return { success: true };
    } catch (error) {
      console.error(`Error deleting row from ${sheetName}:`, error);
      throw error;
    }
  }
  
  static columnToLetter(column) {
    let temp, letter = '';
    while (column > 0) {
      temp = (column - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      column = (column - temp - 1) / 26;
    }
    return letter;
  }
  
  static generateId() {
    return crypto.randomBytes(8).toString('hex');
  }
}

module.exports = { SheetsHelper, SHEETS };