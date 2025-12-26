import { prisma } from "../../config/prisma.client";
import { NotFoundError } from "../../shared/errors/app-error";

// Dashboard statistics
export const getDashboardStats = async () => {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    recentOrders,
    lowStockProducts,
    ordersByStatus,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "DELIVERED"] } },
      _sum: { total_amount: true },
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { created_at: "desc" },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        _count: {
          select: { items: true },
        },
      },
    }),
    prisma.product.findMany({
      where: { stock: { lte: 10 } },
      orderBy: { stock: "asc" },
      take: 10,
      select: {
        id: true,
        name: true,
        stock: true,
        price: true,
      },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const statusCounts = ordersByStatus.reduce((acc, curr) => {
    acc[curr.status] = curr._count;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: totalRevenue._sum?.total_amount || 0,
    recentOrders,
    lowStockProducts,
    ordersByStatus: statusCounts,
  };
};

// Get all orders with filters
export const getAllOrders = async (
  page = 1,
  limit = 20,
  status?: string,
  search?: string
) => {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { id: { contains: search, mode: "insensitive" } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      include: {
        user: {
          select: { id: true, email: true, name: true, phone: true },
        },
        shipping_address: true,
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true },
            },
          },
        },
        payment: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Update order status
export const updateOrderStatus = async (
  orderId: string,
  status: string,
  trackingNumber?: string
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) throw new NotFoundError("Order not found");

  const updateData: any = { status };
  if (trackingNumber) updateData.tracking_number = trackingNumber;
  if (status === "SHIPPED" && !order.estimated_delivery) {
    // Set estimated delivery to 7 days from now
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
    updateData.estimated_delivery = estimatedDelivery;
  }

  return await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
  });
};

// Get all users
export const getAllUsers = async (
  page = 1,
  limit = 20,
  role?: string,
  search?: string
) => {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        created_at: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Update user role
export const updateUserRole = async (userId: string, role: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new NotFoundError("User not found");

  return await prisma.user.update({
    where: { id: userId },
    data: { role: role as any },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });
};

// Get product analytics
export const getProductAnalytics = async () => {
  const [topSellingProducts, lowStockProducts, totalRevenue] =
    await Promise.all([
      prisma.orderItem.groupBy({
        by: ["product_id"],
        _sum: {
          quantity: true,
        },
        _count: true,
        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },
        take: 10,
      }),
      prisma.product.findMany({
        where: { stock: { lte: 10 } },
        orderBy: { stock: "asc" },
        select: {
          id: true,
          name: true,
          stock: true,
          price: true,
        },
      }),
      prisma.orderItem.aggregate({
        _sum: {
          quantity: true,
        },
      }),
    ]);

  // Fetch product details for top selling
  const productIds = topSellingProducts.map((p) => p.product_id);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, price: true, stock: true },
  });

  const topSelling = topSellingProducts.map((item) => {
    const product = products.find((p) => p.id === item.product_id);
    return {
      product,
      totalSold: item._sum.quantity || 0,
      orderCount: item._count,
    };
  });

  return {
    topSellingProducts: topSelling,
    lowStockProducts,
    totalItemsSold: totalRevenue._sum.quantity || 0,
  };
};
