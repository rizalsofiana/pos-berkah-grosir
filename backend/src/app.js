const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { errorHandler } = require('./middleware');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use('/uploads', express.static('public/uploads'));

app.use('/api', routes);

app.use(errorHandler);

module.exports = app;