const { SheetsHelper, SHEETS } = require('./config/sheets');

async function testSheetsHelper() {
  try {
    console.log('Testing Sheets Helper...');
    
    // List all sheet names
    console.log('Sheet names in config:');
    Object.entries(SHEETS).forEach(([key, value]) => {
      console.log(`- ${key}: ${value}`);
    });
    
    // Test getting rows from each sheet
    for (const [key, sheetName] of Object.entries(SHEETS)) {
      try {
        console.log(`\nTesting ${key} sheet (${sheetName})...`);
        const rows = await SheetsHelper.getRows(sheetName);
        console.log(`Found ${rows.length} rows in ${sheetName} sheet.`);
        
        if (rows.length > 0) {
          console.log('First row sample:', rows[0]);
        } else {
          console.log('No rows found. Sheet might be empty.');
        }
      } catch (error) {
        console.error(`Error testing ${sheetName} sheet:`, error.message);
      }
    }
    
    console.log('\nSheets Helper test completed!');
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testSheetsHelper();