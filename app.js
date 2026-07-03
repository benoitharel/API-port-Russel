const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');
const swaggerSpec = require('./config/swagger');
const authRoutes = require('./routes/authRoutes');
const catwayRoutes = require('./routes/catwayRoutes');
const userRoutes = require('./routes/userRoutes');
const homeRoutes = require('./routes/pages/homeRoutes');
const dashboardRoutes = require('./routes/pages/dashboardRoutes');
const catwayPageRoutes = require('./routes/pages/catwayPageRoutes');
const { requireAuth } = require('./middlewares/auth');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.use('/', homeRoutes);
app.use('/', authRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/catways', requireAuth, catwayRoutes);
app.use('/users', requireAuth, userRoutes);
app.use('/dashboard', requireAuth, dashboardRoutes);
app.use('/dashboard/catways', requireAuth, catwayPageRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
