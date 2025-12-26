import { prisma } from "../../config/prisma.client";
import { generateUniqueSlug } from "../../shared/utils/slug.util";
import { NotFoundError, BadRequestError } from "../../shared/errors/app-error";

export const createCategory = async (data: any) => {
  // Generate unique slug
  const slug = await generateUniqueSlug(data.name, "category");

  // Check if parent exists
  if (data.parent_id) {
    const parent = await prisma.category.findUnique({
      where: { id: data.parent_id },
    });
    if (!parent) throw new NotFoundError("Parent category not found");
  }

  const category = await prisma.category.create({
    data: {
      ...data,
      slug,
    },
    include: {
      parent: true,
      children: true,
    },
  });

  return category;
};

export const getAllCategories = async (includeProducts = false) => {
  return await prisma.category.findMany({
    where: { parent_id: null }, // Only root categories
    include: {
      children: {
        include: {
          children: true,
          ...(includeProducts && {
            products: {
              take: 5,
              include: {
                images: {
                  where: { is_primary: true },
                  take: 1,
                },
              },
            },
          }),
        },
      },
      ...(includeProducts && {
        products: {
          take: 5,
          include: {
            images: {
              where: { is_primary: true },
              take: 1,
            },
          },
        },
      }),
    },
    orderBy: { name: "asc" },
  });
};

export const getCategoryById = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      parent: true,
      children: true,
      _count: {
        select: { products: true },
      },
    },
  });

  if (!category) throw new NotFoundError("Category not found");
  return category;
};

export const getCategoryBySlug = async (slug: string) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: true,
      _count: {
        select: { products: true },
      },
    },
  });

  if (!category) throw new NotFoundError("Category not found");
  return category;
};

export const updateCategory = async (categoryId: string, data: any) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) throw new NotFoundError("Category not found");

  // Prevent circular parent relationship
  if (data.parent_id === categoryId) {
    throw new BadRequestError("Category cannot be its own parent");
  }

  // Generate new slug if name is updated
  if (data.name && data.name !== category.name) {
    data.slug = await generateUniqueSlug(data.name, "category");
  }

  // Check if parent exists
  if (data.parent_id) {
    const parent = await prisma.category.findUnique({
      where: { id: data.parent_id },
    });
    if (!parent) throw new NotFoundError("Parent category not found");
  }

  return await prisma.category.update({
    where: { id: categoryId },
    data,
    include: {
      parent: true,
      children: true,
    },
  });
};

export const deleteCategory = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      children: true,
      _count: {
        select: { products: true },
      },
    },
  });

  if (!category) throw new NotFoundError("Category not found");

  if (category.children.length > 0) {
    throw new BadRequestError(
      "Cannot delete category with subcategories. Delete or move subcategories first."
    );
  }

  if (category._count.products > 0) {
    throw new BadRequestError(
      `Cannot delete category with ${category._count.products} products. Move or delete products first.`
    );
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  return { message: "Category deleted successfully" };
};

export const getCategoryProducts = async (
  categoryId: string,
  page = 1,
  limit = 20,
  sortBy = "newest"
) => {
  const skip = (page - 1) * limit;

  let orderBy: any = { created_at: "desc" };
  if (sortBy === "price_asc") orderBy = { price: "asc" };
  if (sortBy === "price_desc") orderBy = { price: "desc" };
  if (sortBy === "name") orderBy = { name: "asc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { category_id: categoryId },
      skip,
      take: limit,
      orderBy,
      include: {
        category: true,
        images: {
          where: { is_primary: true },
          take: 1,
        },
        _count: {
          select: { reviews: true },
        },
      },
    }),
    prisma.product.count({
      where: { category_id: categoryId },
    }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
