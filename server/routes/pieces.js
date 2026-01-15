import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Obtener todas las piezas cerámicas
router.get('/', async (req, res) => {
  try {
    const [pieces] = await pool.query('SELECT * FROM ceramic_pieces ORDER BY fecha_creacion DESC');
    
    const formattedPieces = pieces.map(piece => ({
      id: piece.id,
      alumnoId: piece.alumno_id,
      owner: piece.owner,
      description: piece.description,
      status: piece.status,
      fechaCreacion: piece.fecha_creacion,
      fechaConclusion: piece.fecha_conclusion,
      glazeType: piece.glaze_type,
      deliveryDate: piece.delivery_date,
      notes: piece.notes,
      extraCommentary: piece.extra_commentary,
      tecnica: piece.tecnica,
      hornoId: piece.horno_id,
      lote: piece.lote,
      foto: piece.foto
    }));

    res.json(formattedPieces);
  } catch (error) {
    console.error('Error al obtener piezas:', error);
    res.status(500).json({ error: 'Error al obtener piezas' });
  }
});

// Crear o actualizar pieza
router.post('/', async (req, res) => {
  const piece = req.body;
  
  try {
    await pool.query(`
      INSERT INTO ceramic_pieces (
        id, alumno_id, owner, description, status, fecha_creacion, fecha_conclusion,
        glaze_type, delivery_date, notes, extra_commentary, tecnica, horno_id, lote, foto
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        alumno_id = VALUES(alumno_id),
        owner = VALUES(owner),
        description = VALUES(description),
        status = VALUES(status),
        fecha_creacion = VALUES(fecha_creacion),
        fecha_conclusion = VALUES(fecha_conclusion),
        glaze_type = VALUES(glaze_type),
        delivery_date = VALUES(delivery_date),
        notes = VALUES(notes),
        extra_commentary = VALUES(extra_commentary),
        tecnica = VALUES(tecnica),
        horno_id = VALUES(horno_id),
        lote = VALUES(lote),
        foto = VALUES(foto)
    `, [
      piece.id,
      piece.alumnoId,
      piece.owner,
      piece.description,
      piece.status,
      piece.fechaCreacion,
      piece.fechaConclusion,
      piece.glazeType,
      piece.deliveryDate,
      piece.notes,
      piece.extraCommentary,
      piece.tecnica,
      piece.hornoId,
      piece.lote,
      piece.foto
    ]);

    res.json({ success: true, piece });
  } catch (error) {
    console.error('Error al guardar pieza:', error);
    res.status(500).json({ error: 'Error al guardar pieza' });
  }
});

// Eliminar pieza
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM ceramic_pieces WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar pieza:', error);
    res.status(500).json({ error: 'Error al eliminar pieza' });
  }
});

export default router;
