import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'taller_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para inicializar la base de datos
export async function initializeDatabase() {
  const connection = await pool.getConnection();
  
  try {
    // Crear tabla de estudiantes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        classes_remaining INT DEFAULT 0,
        status ENUM('regular', 'needs_renewal', 'new') DEFAULT 'new',
        payment_method VARCHAR(100),
        notes TEXT,
        price DECIMAL(10, 2),
        class_type VARCHAR(100),
        expiry_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de sesiones de clase
    await connection.query(`
      CREATE TABLE IF NOT EXISTS class_sessions (
        id VARCHAR(255) PRIMARY KEY,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de estudiantes en sesiones
    await connection.query(`
      CREATE TABLE IF NOT EXISTS session_students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        attendance_status ENUM('none', 'present', 'absent') DEFAULT 'none',
        FOREIGN KEY (session_id) REFERENCES class_sessions(id) ON DELETE CASCADE,
        UNIQUE KEY unique_session_student (session_id, student_name)
      )
    `);

    // Crear tabla de piezas cerámicas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ceramic_pieces (
        id VARCHAR(255) PRIMARY KEY,
        alumno_id VARCHAR(255),
        owner VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('creada', 'en secado', 'bizcochada', 'esmaltada', 'cocida final', 'concluida') DEFAULT 'creada',
        fecha_creacion DATE NOT NULL,
        fecha_conclusion DATE,
        glaze_type VARCHAR(100),
        delivery_date DATE,
        notes TEXT,
        extra_commentary TEXT,
        tecnica VARCHAR(100),
        horno_id VARCHAR(100),
        lote VARCHAR(100),
        foto TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de gift cards
    await connection.query(`
      CREATE TABLE IF NOT EXISTS gift_cards (
        id VARCHAR(255) PRIMARY KEY,
        buyer VARCHAR(255) NOT NULL,
        recipient VARCHAR(255) NOT NULL,
        num_classes INT NOT NULL,
        type ENUM('modelado', 'torno') NOT NULL,
        scheduled_date DATE,
        created_at_gift TIMESTAMP NOT NULL,
        extra_commentary TEXT
      )
    `);

    // Crear tabla de asistencia histórica
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attendance_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(255) NOT NULL,
        session_id VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        status ENUM('present', 'absent') NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE KEY unique_student_session (student_id, session_id)
      )
    `);

    // Crear tabla de clases asignadas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS assigned_classes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  } finally {
    connection.release();
  }
}

export default pool;
