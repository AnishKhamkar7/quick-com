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
            city: true,
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

  async updateUserProfile(userId: string, updateData: any) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
    return updatedUser;
  }

  updateCustomerProfile = async (
    userId: string,
    updateData: { address?: string },
  ) => {
    const customer = await this.getCustomerByUserId(userId);
    if (!customer) {
      throw new Error("Customer profile not found");
    }
    const updatedCustomer = await prisma.customer.update({
      where: { id: customer.id },
      data: updateData,
    });
    return updatedCustomer;
  };

  updateDeliveryPartnerProfile = async (
    userId: string,
    updateData: { vehicleType?: string },
  ) => {
    const deliveryPartner = await this.getDeliveryPartnerByUserId(userId);
    if (!deliveryPartner) {
      throw new Error("Delivery partner profile not found");
    }
    const updatedDeliveryPartner = await prisma.deliveryPartner.update({
      where: { id: deliveryPartner.id },
      data: updateData,
    });
    return updatedDeliveryPartner;
  };
}
