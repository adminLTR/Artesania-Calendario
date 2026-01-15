const giftcardService = require('../services/giftcard.service');
const { body, validationResult } = require('express-validator');

class GiftCardController {
  async getAll(req, res) {
    try {
      const giftCards = await giftcardService.getAllGiftCards();
      res.json(giftCards);
    } catch (error) {
      console.error('Error al obtener tarjetas de regalo:', error);
      res.status(500).json({ error: 'Error al obtener tarjetas de regalo' });
    }
  }

  async getById(req, res) {
    try {
      const giftCard = await giftcardService.getGiftCardById(req.params.id);
      if (!giftCard) {
        return res.status(404).json({ error: 'Tarjeta de regalo no encontrada' });
      }
      res.json(giftCard);
    } catch (error) {
      console.error('Error al obtener tarjeta de regalo:', error);
      res.status(500).json({ error: 'Error al obtener tarjeta de regalo' });
    }
  }

  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const giftCard = await giftcardService.createGiftCard(req.body);
      res.status(201).json(giftCard);
    } catch (error) {
      console.error('Error al crear tarjeta de regalo:', error);
      res.status(500).json({ error: 'Error al crear tarjeta de regalo' });
    }
  }

  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const giftCard = await giftcardService.updateGiftCard(req.params.id, req.body);
      res.json(giftCard);
    } catch (error) {
      console.error('Error al actualizar tarjeta de regalo:', error);
      res.status(500).json({ error: 'Error al actualizar tarjeta de regalo' });
    }
  }

  async delete(req, res) {
    try {
      await giftcardService.deleteGiftCard(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar tarjeta de regalo:', error);
      res.status(500).json({ error: 'Error al eliminar tarjeta de regalo' });
    }
  }

  getValidationRules() {
    return [
      body('buyerId').trim().notEmpty().withMessage('El comprador es requerido'),
      body('recipientId').trim().notEmpty().withMessage('El destinatario es requerido'),
      body('numClasses').isInt({ min: 1 }).withMessage('Número de clases debe ser mayor a 0'),
      body('type').isIn(['modelado', 'torno']).withMessage('Tipo inválido'),
      body('scheduledDate').optional().isISO8601().withMessage('Fecha inválida'),
      body('extraCommentary').optional().trim()
    ];
  }
}

module.exports = new GiftCardController();
