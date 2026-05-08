const { db } = require('./src/config');

db.authenticate()
    .then(() => console.log('✅ Database connected successfully.'))
    .catch(err => console.error('❌ Unable to connect to the database:', err));