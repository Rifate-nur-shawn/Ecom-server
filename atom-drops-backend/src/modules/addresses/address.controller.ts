import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as addressService from './address.service';

export const createAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const address = await addressService.createAddress(userId, req.body);

    res.status(StatusCodes.CREATED).json({
      message: 'Address created successfully',
      data: address,
    });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const getAddresses = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const addresses = await addressService.getUserAddresses(userId);

    res.status(StatusCodes.OK).json({ data: addresses });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const getAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const address = await addressService.getAddressById(userId, req.params.id);

    res.status(StatusCodes.OK).json({ data: address });
  } catch (error: any) {
    res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const address = await addressService.updateAddress(
      userId,
      req.params.id,
      req.body
    );

    res.status(StatusCodes.OK).json({
      message: 'Address updated successfully',
      data: address,
    });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await addressService.deleteAddress(userId, req.params.id);

    res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};
