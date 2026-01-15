import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Obtener todas las gift cards
router.get('/', async (req, res) => {
  try {
    const [giftcards] = await pool.query('SELECT * FROM gift_cards ORDER BY created_at_gift DESC');
    
    const formattedGiftCards = giftcards.map(gc => ({
      id: gc.id,
      buyer: gc.buyer,
      recipient: gc.recipient,
      numClasses: gc.num_classes,
      type: gc.type,
      scheduledDate: gc.scheduled_date,
      createdAt: gc.created_at_gift,
      extraCommentary: gc.extra_commentary
    }));

    res.json(formattedGiftCards);
  } catch (error) {
    console.error('Error al obtener gift cards:', error);
    res.status(500).json({ error: 'Error al obtener gift cards' });
  }
});

// Crear o actualizar gift card
router.post('/', async (req, res) => {
  const giftcard = req.body;
  
  try {
    await pool.query(`
      INSERT INTO gift_cards (id, buyer, recipient, num_classes, type, scheduled_date, created_at_gift, extra_commentary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        buyer = VALUES(buyer),
        recipient = VALUES(recipient),
        num_classes = VALUES(num_classes),
        type = VALUES(type),
        scheduled_date = VALUES(scheduled_date),
        created_at_gift = VALUES(created_at_gift),
        extra_commentary = VALUES(extra_commentary)
    `, [
      giftcard.id,
      giftcard.buyer,
      giftcard.recipient,
      giftcard.numClasses,
      giftcard.type,
      giftcard.scheduledDate,
      giftcard.createdAt,
      giftcard.extraCommentary
    ]);

    res.json({ success: true, giftcard });
  } catch (error) {
    console.error('Error al guardar gift card:', error);
    res.status(500).json({ error: 'Error al guardar gift card' });
  }
});

// Eliminar gift card
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM gift_cards WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar gift card:', error);
    res.status(500).json({ error: 'Error al eliminar gift card' });
  }
});

export default router;
