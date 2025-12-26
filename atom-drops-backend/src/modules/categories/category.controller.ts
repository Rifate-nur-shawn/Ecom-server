import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as categoryService from './category.service';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.createCategory(req.body);

    res.status(StatusCodes.CREATED).json({
      message: 'Category created successfully',
      data: category,
    });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const includeProducts = req.query.includeProducts === 'true';
    const categories = await categoryService.getAllCategories(includeProducts);

    res.status(StatusCodes.OK).json({ data: categories });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const getCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);

    res.status(StatusCodes.OK).json({ data: category });
  } catch (error: any) {
    res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug);

    res.status(StatusCodes.OK).json({ data: category });
  } catch (error: any) {
    res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.updateCategory(
      req.params.id,
      req.body
    );

    res.status(StatusCodes.OK).json({
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);

    res.status(StatusCodes.OK).json(result);
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

export const getCategoryProducts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const sortBy = (req.query.sortBy as string) || 'newest';

    const result = await categoryService.getCategoryProducts(
      id,
      page,
      limit,
      sortBy
    );

    res.status(StatusCodes.OK).json({ data: result });
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};
