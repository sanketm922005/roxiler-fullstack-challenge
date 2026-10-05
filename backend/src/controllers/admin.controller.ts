import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';
import { createUserSchema, createStoreSchema } from '../utils/validators';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

export const getAdminStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    res.status(200).json({
      totalUsers,
      totalStores,
      totalRatings,
    });
  } catch (error: any) {
    console.error('getAdminStats error:', error);
    res.status(500).json({ message: 'Internal server error retrieving admin stats.' });
  }
};

export const addUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = createUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { name, email, password, address, role } = parseResult.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: 'User with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address,
        role: role as Role,
      },
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('addUser error:', error);
    res.status(500).json({ message: 'Internal server error creating user.' });
  }
};

export const addStore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = createStoreSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { name, email, address, ownerId } = parseResult.data;

    const existingStore = await prisma.store.findUnique({ where: { email } });
    if (existingStore) {
      res.status(409).json({ message: 'Store with this email already exists.' });
      return;
    }

    if (ownerId) {
      const ownerUser = await prisma.user.findUnique({
        where: { id: ownerId },
        include: { store: true },
      });

      if (!ownerUser) {
        res.status(404).json({ message: 'Assigned store owner user not found.' });
        return;
      }

      if (ownerUser.role !== 'STORE_OWNER') {
        res.status(400).json({ message: 'Assigned user does not have the STORE_OWNER role.' });
        return;
      }

      if (ownerUser.store) {
        res.status(400).json({ message: 'This user already owns a store.' });
        return;
      }
    }

    const store = await prisma.store.create({
      data: {
        name,
        email,
        address,
        ownerId: ownerId || null,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({
      message: 'Store created successfully',
      store,
    });
  } catch (error: any) {
    console.error('addStore error:', error);
    res.status(500).json({ message: 'Internal server error creating store.' });
  }
};

export const listUsers = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      email,
      address,
      role,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query as Record<string, string>;

    const where: any = {};

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }
    if (address) {
      where.address = { contains: address, mode: 'insensitive' };
    }
    if (role && (role === 'ADMIN' || role === 'USER' || role === 'STORE_OWNER')) {
      where.role = role as Role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        store: {
          select: {
            id: true,
            name: true,
            ratings: {
              select: { rating: true },
            },
          },
        },
      },
    });

    // Compute store owner rating
    let formattedUsers = users.map((u) => {
      let ownerRating: number | null = null;
      let totalRatings = 0;
      if (u.role === 'STORE_OWNER' && u.store) {
        totalRatings = u.store.ratings.length;
        ownerRating =
          totalRatings > 0
            ? Number(
                (
                  u.store.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
                ).toFixed(2)
              )
            : 0;
      }
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        address: u.address,
        role: u.role,
        rating: ownerRating,
        storeName: u.store?.name || null,
        totalRatings,
        createdAt: u.createdAt,
      };
    });

    // In-memory sort supporting computed rating or standard fields
    const order = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
    formattedUsers.sort((a: any, b: any) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (valA === null || valA === undefined) return 1 * order;
      if (valB === null || valB === undefined) return -1 * order;

      if (typeof valA === 'string') {
        return valA.localeCompare(valB) * order;
      }
      return (valA - valB) * order;
    });

    res.status(200).json({ users: formattedUsers });
  } catch (error: any) {
    console.error('listUsers error:', error);
    res.status(500).json({ message: 'Internal server error listing users.' });
  }
};

export const listStores = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      email,
      address,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query as Record<string, string>;

    const where: any = {};

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }
    if (address) {
      where.address = { contains: address, mode: 'insensitive' };
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        ratings: {
          select: { rating: true },
        },
      },
    });

    let formattedStores = stores.map((s) => {
      const totalRatings = s.ratings.length;
      const avgRating =
        totalRatings > 0
          ? Number((s.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(2))
          : 0;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        rating: avgRating,
        totalRatings,
        owner: s.owner,
        createdAt: s.createdAt,
      };
    });

    // In-memory sort supporting rating or standard fields
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
    console.error('listStores error:', error);
    res.status(500).json({ message: 'Internal server error listing stores.' });
  }
};

export const getAvailableStoreOwners = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const owners = await prisma.user.findMany({
      where: {
        role: 'STORE_OWNER',
        store: null, // User is a STORE_OWNER without an assigned store yet
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    res.status(200).json({ owners });
  } catch (error: any) {
    console.error('getAvailableStoreOwners error:', error);
    res.status(500).json({ message: 'Internal server error fetching owners.' });
  }
};
