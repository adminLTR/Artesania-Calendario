const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');

// Rutas CRUD para clientes
router.get('/', clientController.getAll.bind(clientController));
router.get('/:id', clientController.getById.bind(clientController));
router.post('/', clientController.getValidationRules(), clientController.create.bind(clientController));
router.put('/:id', clientController.getValidationRules(), clientController.update.bind(clientController));
router.delete('/:id', clientController.delete.bind(clientController));

module.exports = router;
