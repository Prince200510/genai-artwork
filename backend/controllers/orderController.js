const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// Create a new order and notify artisan
const createOrder = async (req, res) => {
  try {
    const { productId, paymentMethod, shippingAddress } = req.body;
    const buyerId = req.user.id;

    // Get product details
    const product = await Product.findById(productId).populate('artist');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Create order
    const order = new Order({
      product: productId,
      buyer: buyerId,
      artist: product.artist._id,
      price: product.price,
      paymentMethod: paymentMethod || 'Digital Payment',
      shippingAddress: shippingAddress || 'Digital Delivery',
      status: 'pending',
      orderDate: new Date()
    });

    await order.save();

    // In a real application, here you would:
    // 1. Send email/SMS notification to the artisan
    // 2. Send push notification if they have the mobile app
    // 3. Create in-app notification
    
    console.log(`🔔 ORDER NOTIFICATION: ${product.artist.name} has a new order for "${product.title}"!`);
    
    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('product')
      .populate('buyer', 'name email')
      .populate('artist', 'name email');

    res.status(201).json({
      message: 'Order placed successfully! Artisan has been notified.',
      order: populatedOrder
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to place order', error: error.message });
  }
};

// Get orders for a user (buyer)
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const orders = await Order.find({ buyer: userId })
      .populate('product')
      .populate('artist', 'name email')
      .sort({ orderDate: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// Get orders for an artisan (their products)
const getArtisanOrders = async (req, res) => {
  try {
    const artistId = req.user.id;
    
    const orders = await Order.find({ artist: artistId })
      .populate('product')
      .populate('buyer', 'name email')
      .sort({ orderDate: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching artisan orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getArtisanOrders
};