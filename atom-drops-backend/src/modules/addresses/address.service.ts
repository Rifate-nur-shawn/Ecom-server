import { prisma } from '../../config/prisma.client';
import { NotFoundError } from '../../shared/errors/app-error';

export const createAddress = async (userId: string, data: any) => {
  // If this is set as default, unset all other defaults
  if (data.is_default) {
    await prisma.address.updateMany({
      where: { user_id: userId },
      data: { is_default: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      ...data,
      user_id: userId,
    },
  });

  return address;
};

export const getUserAddresses = async (userId: string) => {
  return await prisma.address.findMany({
    where: { user_id: userId },
    orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
  });
};

export const getAddressById = async (userId: string, addressId: string) => {
  const address = await prisma.address.findFirst({
    where: { id: addressId, user_id: userId },
  });

  if (!address) throw new NotFoundError('Address not found');
  return address;
};

export const updateAddress = async (
  userId: string,
  addressId: string,
  data: any
) => {
  const address = await prisma.address.findFirst({
    where: { id: addressId, user_id: userId },
  });

  if (!address) throw new NotFoundError('Address not found');

  if (data.is_default) {
    await prisma.address.updateMany({
      where: { user_id: userId, id: { not: addressId } },
      data: { is_default: false },
    });
  }

  return await prisma.address.update({
    where: { id: addressId },
    data,
  });
};

export const deleteAddress = async (userId: string, addressId: string) => {
  const address = await prisma.address.findFirst({
    where: { id: addressId, user_id: userId },
  });

  if (!address) throw new NotFoundError('Address not found');

  await prisma.address.delete({
    where: { id: addressId },
  });

  return { message: 'Address deleted successfully' };
};
