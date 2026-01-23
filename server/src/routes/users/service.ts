import prisma from "../../db";

export class UsersService {
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        customer: {
          select: {
            id: true,
            address: true,
          },
        },
        deliveryPartner: {
          select: {
            id: true,
            vehicleType: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
  async getCustomerByUserId(userId: string) {
    console.log("Fetching customer for userId:", userId);
    return prisma.customer.findUnique({
      where: { userId },
    });
  }

  async getDeliveryPartnerByUserId(userId: string) {
    return prisma.deliveryPartner.findUnique({
      where: { userId },
    });
  }
}
