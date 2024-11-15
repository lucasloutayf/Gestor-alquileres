const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(':memory:');

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const initDb = async () => {
  try {
    // Properties table
    await run(`
      CREATE TABLE IF NOT EXISTS properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        total_rooms INTEGER NOT NULL
      )
    `);

    // Rooms table
    await run(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        property_id INTEGER,
        room_number TEXT NOT NULL,
        status TEXT CHECK(status IN ('occupied', 'vacant', 'maintenance')) DEFAULT 'vacant',
        price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (property_id) REFERENCES properties (id)
      )
    `);

    // Tenants table with more detailed information
    await run(`
      CREATE TABLE IF NOT EXISTS tenants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        dni TEXT NOT NULL UNIQUE,
        telefono TEXT,
        telefono_conocido TEXT,
        precio_pieza DECIMAL(10,2),
        estado_pago TEXT CHECK(estado_pago IN ('al_dia', 'debe')),
        fecha_ingreso DATE NOT NULL,
        fecha_recibo DATE,
        fecha_vencimiento DATE,
        deposito_garantia DECIMAL(10,2),
        notas TEXT,
        FOREIGN KEY (room_id) REFERENCES rooms (id)
      )
    `);

    // Payments history table
    await run(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER,
        amount DECIMAL(10,2) NOT NULL,
        payment_date DATE NOT NULL,
        payment_type TEXT CHECK(payment_type IN ('rent', 'deposit', 'services')),
        receipt_number TEXT,
        notes TEXT,
        FOREIGN KEY (tenant_id) REFERENCES tenants (id)
      )
    `);

    // Maintenance requests table
    await run(`
      CREATE TABLE IF NOT EXISTS maintenance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER,
        description TEXT NOT NULL,
        status TEXT CHECK(status IN ('pending', 'in_progress', 'completed')),
        reported_date DATE NOT NULL,
        completed_date DATE,
        cost DECIMAL(10,2),
        notes TEXT,
        FOREIGN KEY (room_id) REFERENCES rooms (id)
      )
    `);

    // Insert initial properties
    await run(`
      INSERT OR IGNORE INTO properties (id, name, address, total_rooms) VALUES 
      (1, 'Neuquen 266', 'Neuquen 266', 5),
      (2, 'Neuquen 274', 'Neuquen 274', 5),
      (3, 'Santa Rosa 1459', 'Santa Rosa 1459', 5)
    `);

    // Insert rooms for each property
    for (let propertyId = 1; propertyId <= 3; propertyId++) {
      for (let roomNum = 1; roomNum <= 5; roomNum++) {
        await run(`
          INSERT OR IGNORE INTO rooms (property_id, room_number, price) 
          VALUES (?, ?, ?)
        `, [propertyId, roomNum.toString(), 50000]);
      }
    }

  } catch (err) {
    console.error('Database initialization error:', err);
    throw err;
  }
};

// Initialize the database
initDb();

module.exports = {
  all,
  run,
  get,
  db
};