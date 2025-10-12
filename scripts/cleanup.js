const db = require('../database');

async function cleanupData() {
  console.log('🧹 Starting data cleanup process...');
  
  try {
    // Clean up old data (older than 30 days)
    await db.cleanupOldData(30);
    
    console.log('✅ Data cleanup completed successfully');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupData();
}

module.exports = { cleanupData };
