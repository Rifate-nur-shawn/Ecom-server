import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as adminService from './admin.service';

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(StatusCodes.OK).json({ data: stats });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const result = await adminService.getAllOrders(page, limit, status, search);
    res.status(StatusCodes.OK).json({ data: result });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, tracking_number } = req.body;

    const order = await adminService.updateOrderStatus(
      id,
      status,
      tracking_number
    );

    res.status(StatusCodes.OK).json({
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as string;
    const search = req.query.search as string;

    const result = await adminService.getAllUsers(page, limit, role, search);
    res.status(StatusCodes.OK).json({ data: result });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await adminService.updateUserRole(id, role);

    res.status(StatusCodes.OK).json({
      message: 'User role updated successfully',
      data: user,
    });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const getProductAnalytics = async (_req: Request, res: Response) => {
  try {
    const analytics = await adminService.getProductAnalytics();
    res.status(StatusCodes.OK).json({ data: analytics });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};
