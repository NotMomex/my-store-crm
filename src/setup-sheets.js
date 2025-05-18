const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

async function setupSheets() {
  try {
    console.log('Setting up Google Sheets...');
    
    // Path to the credentials file
    const CREDENTIALS_PATH = path.join(__dirname, 'config', 'credentials', 'google-credentials.json');
    
    // Create a new JWT client using the credentials
    const auth = new google.auth.GoogleAuth({
      keyFile: CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    
    // Spreadsheet ID from .env file
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    // Get existing sheets
    const sheetsResponse = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    
    const existingSheets = sheetsResponse.data.sheets.map(s => s.properties.title);
    console.log('Existing sheets:', existingSheets);
    
    // Define required sheets and their headers
    const requiredSheets = {
      'Customers': ['ID', 'Name', 'Email', 'Phone', 'Address', 'CreatedAt'],
      'Products': ['ID', 'Name', 'Description', 'Price', 'StockQuantity', 'CreatedAt'],
      'Orders': ['ID', 'CustomerID', 'OrderDate', 'Status', 'TotalAmount', 'PaymentStatus', 'AmountCollected'],
      'OrderItems': ['ID', 'OrderID', 'ProductID', 'Quantity', 'Price'],
      'Reminders': ['ID', 'CustomerID', 'Title', 'Description', 'DueDate', 'Status', 'CreatedAt']
    };
    
    // Create missing sheets and set headers
    for (const [sheetName, headers] of Object.entries(requiredSheets)) {
      if (!existingSheets.includes(sheetName)) {
        console.log(`Creating sheet: ${sheetName}`);
        
        // Add sheet
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          resource: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: sheetName
                  }
                }
              }
            ]
          }
        });
        
        // Add headers
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!A1:${String.fromCharCode(65 + headers.length - 1)}1`,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [headers]
          }
        });
        
        console.log(`Added headers to ${sheetName}`);
      } else {
        console.log(`Sheet ${sheetName} already exists`);
        
        // Check if headers match
        const headersResponse = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${sheetName}!A1:Z1`,
        });
        
        const existingHeaders = headersResponse.data.values?.[0] || [];
        console.log(`Existing headers for ${sheetName}:`, existingHeaders);
        
        // Update headers if needed
        if (!arraysEqual(existingHeaders, headers)) {
          console.log(`Updating headers for ${sheetName}`);
          
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A1:${String.fromCharCode(65 + headers.length - 1)}1`,
            valueInputOption: 'USER_ENTERED',
            resource: {
              values: [headers]
            }
          });
          
          console.log(`Updated headers for ${sheetName}`);
        }
      }
    }
    
    console.log('Sheet setup completed successfully!');
  } catch (error) {
    console.error('Error setting up sheets:', error);
  }
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

setupSheets();