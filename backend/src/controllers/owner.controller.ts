import { Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getOwnerDashboard = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const {
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query as Record<string, string>;

    // Find the store owned by this user
    const store = await prisma.store.findFirst({
      where: { ownerId: req.user.id },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                address: true,
              },
            },
          },
        },
      },
    });

    if (!store) {
      res.status(200).json({
        hasStore: false,
        message: 'No store has been assigned to your account yet. Please contact the administrator.',
        store: null,
        averageRating: 0,
        totalRatings: 0,
        ratings: [],
      });
      return;
    }

    const totalRatings = store.ratings.length;
    const averageRating =
      totalRatings > 0
        ? Number((store.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(2))
        : 0;

    let formattedRatings = store.ratings.map((r) => ({
      id: r.id,
      rating: r.rating,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: {
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        address: r.user.address,
      },
    }));

    // Sorting support
    const order = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
    formattedRatings.sort((a: any, b: any) => {
      let valA: any;
      let valB: any;

      if (sortBy === 'userName') {
        valA = a.user.name;
        valB = b.user.name;
      } else if (sortBy === 'userEmail') {
        valA = a.user.email;
        valB = b.user.email;
      } else if (sortBy === 'rating') {
        valA = a.rating;
        valB = b.rating;
      } else {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }

      if (valA === null || valA === undefined) return 1 * order;
      if (valB === null || valB === undefined) return -1 * order;

      if (typeof valA === 'string') {
        return valA.localeCompare(valB) * order;
      }
      return (valA - valB) * order;
    });

    res.status(200).json({
      hasStore: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
      },
      averageRating,
      totalRatings,
      ratings: formattedRatings,
    });
  } catch (error: any) {
    console.error('getOwnerDashboard error:', error);
    res.status(500).json({ message: 'Internal server error fetching owner dashboard.' });
  }
};
