import { Response } from 'express';
import prisma from '../prisma';
import { submitRatingSchema } from '../utils/validators';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const submitOrUpdateRating = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const parseResult = submitRatingSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { storeId, rating } = parseResult.data;
    const userId = req.user.id;

    // Check store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      res.status(404).json({ message: 'Store not found.' });
      return;
    }

    // Upsert rating (creates if not exists, updates if user already rated)
    const savedRating = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      update: {
        rating,
      },
      create: {
        userId,
        storeId,
        rating,
      },
    });

    res.status(200).json({
      message: 'Rating submitted successfully.',
      rating: savedRating,
    });
  } catch (error: any) {
    console.error('submitOrUpdateRating error:', error);
    res.status(500).json({ message: 'Internal server error submitting rating.' });
  }
};
