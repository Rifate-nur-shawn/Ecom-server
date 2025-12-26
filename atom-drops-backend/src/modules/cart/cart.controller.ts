import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as cartService from "./cart.service";

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const cart = await cartService.getOrCreateCart(userId);

    res.status(StatusCodes.OK).json({ data: cart });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { product_id, quantity } = req.body;

    const item = await cartService.addToCart(userId, product_id, quantity);

    res.status(StatusCodes.CREATED).json({
      message: "Item added to cart",
      data: item,
    });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const result = await cartService.updateCartItem(userId, itemId, quantity);

    res.status(StatusCodes.OK).json({
      message: "Cart updated",
      data: result,
    });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { itemId } = req.params;

    const result = await cartService.removeFromCart(userId, itemId);

    res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await cartService.clearCart(userId);

    res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};
