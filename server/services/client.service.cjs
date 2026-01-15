const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ClientService {
  async getAllClients() {
    return await prisma.client.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async getClientById(id) {
    return await prisma.client.findUnique({
      where: { id }
    });
  }

  async createClient(data) {
    return await prisma.client.create({
      data: {
        name: data.name,
        phone: data.phone || null,
        email: data.email || null
      }
    });
  }

  async updateClient(id, data) {
    return await prisma.client.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone || null,
        email: data.email || null
      }
    });
  }

  async deleteClient(id) {
    return await prisma.client.delete({
      where: { id }
    });
  }
}

module.exports = new ClientService();
