const express = require('express');
const cors = require('cors');
const { all, run, get } = require('./database');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Get all properties
app.get('/api/properties', async (req, res) => {
  try {
    const properties = await all('SELECT * FROM properties');
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all tenants for a property
app.get('/api/properties/:propertyId/tenants', async (req, res) => {
  try {
    const tenants = await all(`
      SELECT t.*, r.room_number, p.name as property_name 
      FROM tenants t
      JOIN rooms r ON t.room_id = r.id
      JOIN properties p ON r.property_id = p.id
      WHERE p.id = ?
    `, [req.params.propertyId]);
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new tenant
app.post('/api/tenants', async (req, res) => {
  try {
    // First check if room is available
    const room = await get('SELECT * FROM rooms WHERE id = ? AND status = "vacant"', [req.body.room_id]);
    if (!room) {
      return res.status(400).json({ error: 'Room is not available' });
    }

    // Start transaction
    await run('BEGIN TRANSACTION');

    // Insert tenant
    const result = await run(`
      INSERT INTO tenants (
        room_id, nombre, apellido, dni, telefono, 
        telefono_conocido, precio_pieza, estado_pago, 
        fecha_ingreso, fecha_recibo, fecha_vencimiento,
        deposito_garantia, notas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.body.room_id,
      req.body.nombre,
      req.body.apellido,
      req.body.dni,
      req.body.telefono,
      req.body.telefono_conocido,
      req.body.precio_pieza,
      req.body.estado_pago,
      req.body.fecha_ingreso,
      req.body.fecha_recibo,
      req.body.fecha_vencimiento,
      req.body.deposito_garantia,
      req.body.notas
    ]);

    // Update room status
    await run('UPDATE rooms SET status = "occupied" WHERE id = ?', [req.body.room_id]);

    // Commit transaction
    await run('COMMIT');
    
    res.json({ id: result.lastID });
  } catch (err) {
    await run('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// Update tenant
app.put('/api/tenants/:id', async (req, res) => {
  try {
    await run(`
      UPDATE tenants 
      SET nombre = ?, apellido = ?, dni = ?, telefono = ?,
          telefono_conocido = ?, precio_pieza = ?, estado_pago = ?, 
          fecha_recibo = ?, fecha_vencimiento = ?, notas = ?
      WHERE id = ?
    `, [
      req.body.nombre,
      req.body.apellido,
      req.body.dni,
      req.body.telefono,
      req.body.telefono_conocido,
      req.body.precio_pieza,
      req.body.estado_pago,
      req.body.fecha_recibo,
      req.body.fecha_vencimiento,
      req.body.notas,
      req.params.id
    ]);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Record payment
app.post('/api/payments', async (req, res) => {
  try {
    const result = await run(`
      INSERT INTO payments (tenant_id, amount, payment_date, payment_type, receipt_number, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      req.body.tenant_id,
      req.body.amount,
      req.body.payment_date,
      req.body.payment_type,
      req.body.receipt_number,
      req.body.notes
    ]);

    res.json({ id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get payment history for a tenant
app.get('/api/tenants/:id/payments', async (req, res) => {
  try {
    const payments = await all(
      'SELECT * FROM payments WHERE tenant_id = ? ORDER BY payment_date DESC',
      [req.params.id]
    );
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});