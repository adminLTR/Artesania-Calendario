const clientService = require('../services/client.service');
const { body, validationResult } = require('express-validator');

class ClientController {
  // Obtener todos los clientes
  async getAll(req, res) {
    try {
      const clients = await clientService.getAllClients();
      res.json(clients);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      res.status(500).json({ error: 'Error al obtener clientes' });
    }
  }

  // Obtener un cliente por ID
  async getById(req, res) {
    try {
      const client = await clientService.getClientById(req.params.id);
      if (!client) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      res.json(client);
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      res.status(500).json({ error: 'Error al obtener cliente' });
    }
  }

  // Crear un nuevo cliente
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const client = await clientService.createClient(req.body);
      res.status(201).json(client);
    } catch (error) {
      console.error('Error al crear cliente:', error);
      res.status(500).json({ error: 'Error al crear cliente' });
    }
  }

  // Actualizar un cliente
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const client = await clientService.updateClient(req.params.id, req.body);
      res.json(client);
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      res.status(500).json({ error: 'Error al actualizar cliente' });
    }
  }

  // Eliminar un cliente
  async delete(req, res) {
    try {
      await clientService.deleteClient(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      if (error.code === 'P2003') {
        return res.status(400).json({ error: 'No se puede eliminar el cliente porque tiene tarjetas de regalo asociadas' });
      }
      res.status(500).json({ error: 'Error al eliminar cliente' });
    }
  }

  // Validaciones
  getValidationRules() {
    return [
      body('name').trim().notEmpty().withMessage('El nombre es requerido'),
      body('phone').optional().trim(),
      body('email').optional().trim().isEmail().withMessage('Email inválido')
    ];
  }
}

module.exports = new ClientController();
