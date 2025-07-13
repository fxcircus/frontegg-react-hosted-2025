const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning up database...\n');

const dbPath = path.join(__dirname, 'database.sqlite');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('✅ Database file deleted');
} else {
  console.log('ℹ️  No database file found');
}

console.log('\n💡 The database will be recreated when you start the server');
console.log('   Run: npm run dev');