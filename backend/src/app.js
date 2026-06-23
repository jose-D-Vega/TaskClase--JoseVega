require('dotenv').config();

const express= require('express');

const cors = require('cors');
const cookieParser = require('cookie-parser');

const { connectDB, pool } = require('./config/db');

const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subtaskRoutes = require('./routes/subtaskRoutes');
const projectRoutes = require('./routes/projectRoutes');

const errorHandler = require('./middleware/errorHandler');

const app= express();

const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(origin => origin.trim()) 
  : ['http://localhost:5173', 'http://172.26.4.3:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (como Postman o peticiones del mismo servidor)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.error(`CORS bloqueado para el origen: ${origin}`);
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Permitir el envío de cookies
}));

app.use(express.json())
app.use(cookieParser());
 
app.use(express.urlencoded({extended:true}))

// Rutas de diagnóstico
app.get('/api/health', async (req, res) => {
  try {
    // Verificar conexión a DB
    await pool.query('SELECT 1');
    
    res.json({ 
      success: true,
      status: 'online', 
      message: 'Sistema TaskFlow operativo',
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'degraded',
      message: 'Error de conexión con la base de datos',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.use('/api/auth', authRoutes);
// Las subtareas están anidadas bajo tareas: /api/tasks/:taskId/subtasks
app.use('/api/tasks/:taskId/subtasks', subtaskRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/projects', projectRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta '${req.originalUrl}' no encontrada`
  });
});


app.use(errorHandler);

module.exports = app;
