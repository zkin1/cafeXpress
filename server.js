const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { body, validationResult } = require('express-validator');
const rateLimit = require("express-rate-limit");
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limita cada IP a 100 solicitudes por ventana
});
app.use("/api/", apiLimiter);

// Conexión a la base de datos
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
    // Configuración de seguridad de SQLite
    db.run("PRAGMA journal_mode=WAL");
    db.run("PRAGMA foreign_keys=ON");
    db.run("PRAGMA busy_timeout=5000");
    db.run("PRAGMA synchronous=FULL");
  }
});

// Configura los permisos del archivo de la base de datos
fs.chmodSync('./database.sqlite', 0o600);

// Función para generar un token seguro
function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Middleware para manejar errores asíncronos
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Simulación de WebPay
const simulateWebPay = {
  ccreateTransaction: (buyOrder, sessionId, amount, returnUrl) => {
    return Promise.resolve({
      url: `http://localhost:${port}/simulated-webpay?buyOrder=${buyOrder}&amount=${amount}&returnUrl=${encodeURIComponent(returnUrl)}`,
      token: uuidv4()
    });
  },
  commitTransaction: (token) => {
    // Simula una transacción exitosa el 80% de las veces
    const isSuccessful = Math.random() < 0.8;
    return Promise.resolve({
      status: isSuccessful ? 'AUTHORIZED' : 'FAILED',
      amount: 1000, // Monto de ejemplo
      buyOrder: 'simulated-buy-order'
    });
  }
};

// Rutas
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) {
      console.error('Error al obtener productos:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (rows.length === 0) {
      console.log('No se encontraron productos');
      return res.status(404).json({ message: 'No se encontraron productos' });
    }
    console.log('Productos obtenidos:', rows);
    res.json({ message: 'success', data: rows });
  });
});

app.post('/api/add-product', (req, res) => {
  const { name, description, price, category, image_url, is_coffee } = req.body;
  db.run(
    'INSERT INTO products (name, description, price, category, image_url, is_coffee) VALUES (?, ?, ?, ?, ?, ?)',
    [name, description, price, category, image_url, is_coffee ? 1 : 0],
    function(err) {
      if (err) {
        console.error('Error al agregar producto:', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Producto agregado', id: this.lastID });
    }
  );
});

app.post('/api/orders', [
    body('name').notEmpty().trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('total_amount').isFloat({ min: 0 }),
    body('status').isIn(['pending', 'completed', 'cancelled']),
    body('items').isArray().notEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, total_amount, status, items } = req.body;
    const orderToken = generateSecureToken();
    
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
  
      db.run('INSERT INTO orders (name, email, total_amount, status, order_token) VALUES (?, ?, ?, ?, ?)', 
        [name, email, total_amount, status, orderToken], 
        function(err) {
          if (err) {
            console.error('Error al insertar orden:', err);
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }
          const orderId = this.lastID;
          
          const stmt = db.prepare('INSERT INTO order_details (order_id, product_id, quantity, price, size, milk_type) VALUES (?, ?, ?, ?, ?, ?)');
          try {
            items.forEach(item => {
              stmt.run(orderId, item.id, item.cantidad, item.price, item.size || null, item.milk || null);
            });
            stmt.finalize();
  
            db.run('COMMIT', (commitErr) => {
              if (commitErr) {
                console.error('Error al hacer commit:', commitErr);
                db.run('ROLLBACK');
                return res.status(500).json({ error: commitErr.message });
              }
              res.status(201).json({ message: 'Orden creada', orderId: orderId, orderToken: orderToken });
            });
          } catch (itemErr) {
            console.error('Error al insertar detalles de la orden:', itemErr);
            db.run('ROLLBACK');
            res.status(500).json({ error: itemErr.message });
          }
        }
      );
    });
});

app.get('/api/orders/:orderId', [
  body('orderToken').notEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { orderId } = req.params;
  const { orderToken } = req.body;

  db.get('SELECT * FROM orders WHERE id = ? AND order_token = ?', [orderId, orderToken], (err, order) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada.' });
    }
    res.json({ message: 'success', data: order });
  });
});

app.get('/api/comandas', (req, res) => {
  db.all(`
    SELECT o.id, o.name, o.status, o.total_amount, 
           od.product_id, od.quantity, od.size, od.milk_type,
           p.name as product_name
    FROM orders o
    JOIN order_details od ON o.id = od.order_id
    JOIN products p ON od.product_id = p.id
    WHERE o.status = "pending"
  `, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Agrupar los resultados por orden
    const comandas = rows.reduce((acc, row) => {
      if (!acc[row.id]) {
        acc[row.id] = {
          id: row.id,
          name: row.name,
          status: row.status,
          total_amount: row.total_amount,
          items: []
        };
      }
      acc[row.id].items.push({
        id: row.product_id,
        name: row.product_name,
        quantity: row.quantity,
        size: row.size,
        milk_type: row.milk_type
      });
      return acc;
    }, {});

    res.json({ comandas: Object.values(comandas) });
  });
});

app.post('/api/comandas/:id/completar', (req, res) => {
  const { id } = req.params;
  db.run('UPDATE orders SET status = "completed" WHERE id = ?', id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Comanda marcada como completada' });
  });
});

app.get('/api/orders/:orderId/status', (req, res) => {
  const { orderId } = req.params;
  db.get('SELECT status FROM orders WHERE id = ?', [orderId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Orden no encontrada.' });
    }
    res.json({ status: row.status });
  });
});

app.post('/api/login-empleado', (req, res) => {
    const { email, password } = req.body;
    
    db.get('SELECT * FROM empleados WHERE email = ?', [email], (err, empleado) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!empleado) {
        return res.status(400).json({ error: 'Credenciales incorrectas' });
      }
      
      // En un entorno de producción, deberías usar bcrypt para comparar contraseñas hasheadas
      if (password !== empleado.password) {
        return res.status(400).json({ error: 'Credenciales incorrectas' });
      }
  
      const token = jwt.sign({ id: empleado.id, email: empleado.email }, 'tu_secreto_jwt', { expiresIn: '1h' });
      res.json({ token, nombre: empleado.nombre });
    });
});

app.post('/create-transaction', asyncHandler(async (req, res) => {
  const { amount, orderDetails, customerEmail, customerName } = req.body;
  const buyOrder = uuidv4();
  const sessionId = uuidv4();
  const returnUrl = `${req.protocol}://${req.get('host')}/webpay-return`;


  app.post('/api/create-order', asyncHandler(async (req, res) => {
    const { orderNumber, customerName, notificacionEmail, emailNotificacion, total, items } = req.body;
  
    db.run('BEGIN TRANSACTION');
  
    try {
      // Insertar en la tabla orders
      const result = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO orders (name, email, total_amount, status, order_token) VALUES (?, ?, ?, ?, ?)',
          [customerName, emailNotificacion || null, total, 'pending', orderNumber],
          function(err) {
            if (err) reject(err);
            else resolve(this);
          }
        );
      });
  
      const orderId = result.lastID;
  
      // Insertar items en order_details
      const stmt = db.prepare('INSERT INTO order_details (order_id, product_id, quantity, price, size, milk_type) VALUES (?, ?, ?, ?, ?, ?)');
      for (const item of items) {
        await new Promise((resolve, reject) => {
          stmt.run(
            [orderId, item.id, item.cantidad, item.price, item.size || null, item.milk || null],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
      stmt.finalize();
  
      await new Promise((resolve, reject) => {
        db.run('COMMIT', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
  
      res.json({ success: true, orderId, orderNumber });
    } catch (error) {
      await new Promise((resolve) => {
        db.run('ROLLBACK', resolve);
      });
      console.error('Error al crear la orden:', error);
      res.status(500).json({ error: 'Error al crear la orden' });
    }
  }));

  db.run('BEGIN TRANSACTION');

  try {
    db.run(
      'INSERT INTO orders (buy_order, name, email, total_amount, status) VALUES (?, ?, ?, ?, ?)',
      [buyOrder, customerName, customerEmail, amount, 'pending'],
      async function(err) {
        if (err) throw err;
        const orderId = this.lastID;

        const stmt = db.prepare('INSERT INTO order_details (order_id, product_id, quantity, price, size, milk_type) VALUES (?, ?, ?, ?, ?, ?)');
        orderDetails.forEach(item => {
          stmt.run(orderId, item.id, item.quantity, item.price, item.size, item.milk_type);
        });
        stmt.finalize();

        try {
          const response = await simulateWebPay.createTransaction(buyOrder, sessionId, amount, returnUrl);
          db.run('COMMIT');
          res.json({ 
            url: response.url, 
            token: response.token,
            buyOrder
          });
        } catch (error) {
          throw error;
        }
      }
    );
  } catch (error) {
    db.run('ROLLBACK');
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Error al crear la transacción' });
  }
}));

app.post('/confirm-transaction', asyncHandler(async (req, res) => {
  const { token_ws, buyOrder } = req.body;

  db.run('BEGIN TRANSACTION');

  try {
    const response = await simulateWebPay.commitTransaction(token_ws);

    if (response.status === 'AUTHORIZED') {
      db.run('UPDATE orders SET status = ? WHERE buy_order = ?', ['completed', buyOrder], function(err) {
        if (err) throw err;
        
        db.get('SELECT * FROM orders WHERE buy_order = ?', [buyOrder], (err, order) => {
          if (err) throw err;

          db.run('INSERT INTO cafe_orders (order_id, status) VALUES (?, ?)', [order.id, 'pending'], function(err) {
            if (err) throw err;

            db.run('COMMIT');
            res.json({ 
              success: true, 
              orderId: order.id,
              message: 'Pago procesado exitosamente'
            });
          });
        });
      });
    } else {
      db.run('UPDATE orders SET status = ? WHERE buy_order = ?', ['failed', buyOrder], function(err) {
        if (err) throw err;
        db.run('COMMIT');
        res.status(400).json({ error: 'Pago no autorizado' });
      });
    }
  } catch (error) {
    db.run('ROLLBACK');
    console.error('Error confirming transaction:', error);
    res.status(500).json({ error: 'Error al confirmar la transacción' });
  }
}));

app.get('/webpay-return', (req, res) => {
  const { token_ws, buyOrder } = req.query;
  res.redirect(`/confirm-payment?token=${token_ws}&buyOrder=${buyOrder}`);
});

// Ruta para simular la página de pago de WebPay
app.get('/simulated-webpay', (req, res) => {
  const { buyOrder, amount, returnUrl } = req.query;
  res.send(`
    <h1>Simulación de WebPay</h1>
    <p>Orden de compra: ${buyOrder}</p>
    <p>Monto: $${amount}</p>
    <form action="${returnUrl}" method="GET">
      <input type="hidden" name="token_ws" value="${uuidv4()}">
      <input type="hidden" name="buyOrder" value="${buyOrder}">
      <button type="submit">Pagar</button>
    </form>
  `);
});

// Manejador de errores global
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});