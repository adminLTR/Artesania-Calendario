import express from 'express';
const router = express.Router();
import giftcardController from '../controllers/giftcard.controller.js';

// Rutas CRUD para tarjetas de regalo
router.get('/', giftcardController.getAll.bind(giftcardController));
router.get('/:id', giftcardController.getById.bind(giftcardController));
router.post('/', giftcardController.getValidationRules(), giftcardController.create.bind(giftcardController));
router.put('/:id', giftcardController.getValidationRules(), giftcardController.update.bind(giftcardController));
router.delete('/:id', giftcardController.delete.bind(giftcardController));

export default router;
