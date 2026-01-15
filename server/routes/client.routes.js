import express from 'express';
const router = express.Router();
import clientController from '../controllers/client.controller.js';

// Rutas CRUD para clientes
router.get('/', clientController.getAll.bind(clientController));
router.get('/:id', clientController.getById.bind(clientController));
router.post('/', clientController.getValidationRules(), clientController.create.bind(clientController));
router.put('/:id', clientController.getValidationRules(), clientController.update.bind(clientController));
router.delete('/:id', clientController.delete.bind(clientController));

export default router;
