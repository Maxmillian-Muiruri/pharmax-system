import { Response } from 'express';
import prisma from '../lib/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth';

// Get user's cart (Remote Sync)
export const getCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: userId
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unitPrice: true,
            category: true,
            quantity: true,
            status: true,
            barcode: true,
            batchNumber: true,
            generic: true,
            minimumStock: true,
            purchasePrice: true,
            supplierId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match frontend expectations
    const transformedCartItems = cartItems.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.product.unitPrice,
      addedAt: item.createdAt.toISOString(),
      // Include product details for frontend
      product: item.product
    }));

    res.status(200).json({
      success: true,
      data: transformedCartItems,
      message: 'Cart retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart'
    });
  }
};

// Update cart (Clear & Replace logic)
export const updateCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { items } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items must be an array'
      });
    }

    // Start a transaction for atomic operations
    await prisma.$transaction(async (tx: any) => {
      // Clear existing cart items for this user
      await tx.cartItem.deleteMany({
        where: {
          userId: userId
        }
      });

      // Add new cart items
      if (items.length > 0) {
        const cartItemsToCreate = items.map((item: any) => ({
          userId: userId,
          productId: item.productId,
          quantity: item.quantity
        }));

        await tx.cartItem.createMany({
          data: cartItemsToCreate
        });
      }
    });

    res.status(200).json({
      success: true,
      message: 'Cart updated successfully'
    });

  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart'
    });
  }
};

// Clear cart after successful checkout
export const clearCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const deleteResult = await prisma.cartItem.deleteMany({
      where: {
        userId: userId
      }
    });

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      deletedCount: deleteResult.count
    });

  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
};

// Add single item to cart (optional helper)
export const addToCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { productId, quantity } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: productId, quantity'
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: userId,
        productId: productId
      }
    });

    let cartItem;

    if (existingItem) {
      // Update existing item quantity
      cartItem = await prisma.cartItem.update({
        where: {
          id: existingItem.id
        },
        data: {
          quantity: existingItem.quantity + quantity
        }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: userId,
          productId: productId,
          quantity: quantity
        }
      });
    }

    res.status(201).json({
      success: true,
      data: cartItem,
      message: 'Item added to cart successfully'
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }
};

// Update single item quantity
export const updateCartItemQuantity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const itemIdStr = Array.isArray(itemId) ? itemId[0] : itemId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemIdStr,
        userId: userId
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    const updatedItem = await prisma.cartItem.update({
      where: {
        id: itemIdStr
      },
      data: {
        quantity: quantity
      }
    });

    res.status(200).json({
      success: true,
      data: updatedItem,
      message: 'Cart item updated successfully'
    });

  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item'
    });
  }
};

// Remove single item from cart
export const removeFromCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.params;

    const itemIdStr = Array.isArray(itemId) ? itemId[0] : itemId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemIdStr,
        userId: userId
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    await prisma.cartItem.delete({
      where: {
        id: itemIdStr
      }
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully'
    });

  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
};
