const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class GiftCardService {
  async getAllGiftCards() {
    return await prisma.giftCard.findMany({
      include: {
        buyer: true,
        recipient: true
      },
      orderBy: { createdAtGift: 'desc' }
    });
  }

  async getGiftCardById(id) {
    return await prisma.giftCard.findUnique({
      where: { id },
      include: {
        buyer: true,
        recipient: true
      }
    });
  }

  async createGiftCard(data) {
    return await prisma.giftCard.create({
      data: {
        buyerId: data.buyerId,
        recipientId: data.recipientId,
        numClasses: data.numClasses,
        type: data.type,
        scheduledDate: data.scheduledDate || null,
        extraCommentary: data.extraCommentary || null
      },
      include: {
        buyer: true,
        recipient: true
      }
    });
  }

  async updateGiftCard(id, data) {
    return await prisma.giftCard.update({
      where: { id },
      data: {
        buyerId: data.buyerId,
        recipientId: data.recipientId,
        numClasses: data.numClasses,
        type: data.type,
        scheduledDate: data.scheduledDate || null,
        extraCommentary: data.extraCommentary || null
      },
      include: {
        buyer: true,
        recipient: true
      }
    });
  }

  async deleteGiftCard(id) {
    return await prisma.giftCard.delete({
      where: { id }
    });
  }
}

module.exports = new GiftCardService();
