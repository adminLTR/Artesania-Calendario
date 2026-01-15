const express = require('express');
const router = express.Router();
const giftcardController = require('../controllers/giftcard.controller');

// Rutas CRUD para tarjetas de regalo
router.get('/', giftcardController.getAll.bind(giftcardController));
router.get('/:id', giftcardController.getById.bind(giftcardController));
router.post('/', giftcardController.getValidationRules(), giftcardController.create.bind(giftcardController));
router.put('/:id', giftcardController.getValidationRules(), giftcardController.update.bind(giftcardController));
router.delete('/:id', giftcardController.delete.bind(giftcardController));

module.exports = router;
