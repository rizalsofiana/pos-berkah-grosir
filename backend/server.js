const app = require('./src/app');
const db = require('./src/config/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await db.authenticate();
        console.log('✅ Database Connected: Berkah Grosir');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
};

startServer();