import { Request, Response } from "express";
import * as orderService from "./order.service";
import { StatusCodes } from "http-status-codes";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { items, shipping_address_id } = req.body;

    const order = await orderService.createOrder(
      userId,
      items,
      shipping_address_id
    );

    res.status(StatusCodes.CREATED).json({
      message: "Order placed successfully",
      data: order,
    });
  } catch (error: any) {
    res
      .status(error.statusCode || StatusCodes.BAD_REQUEST)
      .json({ error: error.message });
  }
};

export const createOrderFromCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { shipping_address_id } = req.body;

    const order = await orderService.createOrderFromCart(
      userId,
      shipping_address_id
    );

    res.status(StatusCodes.CREATED).json({
      message: "Order placed successfully from cart",
      data: order,
    });
  } catch (error: any) {
    res
      .status(error.statusCode || StatusCodes.BAD_REQUEST)
      .json({ error: error.message });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const orders = await orderService.getMyOrders(userId);
    res.status(StatusCodes.OK).json({ data: orders });
  } catch (error: any) {
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const order = await orderService.getOrderById(userId, req.params.id);
    res.status(StatusCodes.OK).json({ data: order });
  } catch (error: any) {
    res
      .status(error.statusCode || StatusCodes.NOT_FOUND)
      .json({ error: error.message });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await orderService.cancelOrder(userId, req.params.id);
    res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    res
      .status(error.statusCode || StatusCodes.BAD_REQUEST)
      .json({ error: error.message });
  }
};
