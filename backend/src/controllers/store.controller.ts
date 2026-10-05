import { Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getStoresForUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const {
      name,
      address,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query as Record<string, string>;

    const where: any = {};

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    if (address) {
      where.address = { contains: address, mode: 'insensitive' };
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        ratings: {
          select: {
            rating: true,
            userId: true,
          },
        },
      },
    });

    const formattedStores = stores.map((store) => {
      const totalRatings = store.ratings.length;
      const overallRating =
        totalRatings > 0
          ? Number((store.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(2))
          : 0;

      const userRatingObj = userId
        ? store.ratings.find((r) => r.userId === userId)
        : null;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        overallRating,
        totalRatings,
        userSubmittedRating: userRatingObj ? userRatingObj.rating : null,
      };
    });

    const order = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
    formattedStores.sort((a: any, b: any) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (valA === null || valA === undefined) return 1 * order;
      if (valB === null || valB === undefined) return -1 * order;

      if (typeof valA === 'string') {
        return valA.localeCompare(valB) * order;
      }
      return (valA - valB) * order;
    });

    res.status(200).json({ stores: formattedStores });
  } catch (error: any) {
    console.error('getStoresForUser error:', error);
    res.status(500).json({ message: 'Internal server error fetching stores.' });
  }
};
