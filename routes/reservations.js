const express = require('express');
const { auth, adminOnly } = require('../middleware/auth');
const Reservation = require('../models/Reservation');
const Item = require('../models/Item');
const router = express.Router();

// Get all reservations (admin only)
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const reservations = await Reservation.find({ status: { $ne: 'ARCHIVED' } })
            .populate('userId', 'username')
            .populate('itemId')
            .exec();
        
        if (!reservations) {
            return res.json([]); // Return empty array if no reservations
        }

        const formattedReservations = reservations
            .filter(reservation => reservation.userId && reservation.itemId) // Filter out any invalid references
            .map(reservation => ({
                _id: reservation._id,
                studentName: reservation.userId.username,
                itemName: reservation.itemId.name,
                location: reservation.itemId.location,
                status: reservation.status,
                quantity: reservation.quantity || 1,
                reservedDate: reservation.reservedDate
            }));

        res.json(formattedReservations);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ 
            message: 'Failed to load reservations',
            error: error.message
        });
    }
});

// Get user's reservations
router.get('/my', auth, async (req, res) => {
    try {
        const reservations = await Reservation.find({ 
            userId: req.user._id, 
            status: { $ne: 'ARCHIVED' } 
        }).populate('itemId');

        // Filter out reservations with deleted items and format the response
        const formattedReservations = reservations
            .filter(reservation => reservation.itemId) // Only include reservations with valid items
            .map(reservation => ({
                _id: reservation._id,
                itemName: reservation.itemId.name,
                location: reservation.itemId.location,
                status: reservation.status,
                quantity: reservation.quantity || 1,
                reservedDate: reservation.reservedDate
            }));

        res.json(formattedReservations);
    } catch (error) {
        console.error('Error fetching user reservations:', error);
        res.status(500).json({ 
            message: 'Failed to load reservations',
            error: error.message
        });
    }
});

// Create reservation
router.post('/', auth, async (req, res) => {
    try {
        const item = await Item.findById(req.body.itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const requestedQuantity = parseInt(req.body.quantity) || 1;
        if (item.quantity < item.reserved + requestedQuantity) {
            return res.status(400).json({ message: 'Requested quantity is not available' });
        }

        const reservation = new Reservation({
            itemId: req.body.itemId,
            userId: req.user._id,
            quantity: requestedQuantity
        });

        await reservation.save();
        item.reserved += requestedQuantity;
        await item.save();

        res.status(201).json(reservation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update reservation status (admin can update any, students can only request returns)
router.patch('/:id', auth, async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate('userId');
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Check authorization
        const isAdmin = req.user.role === 'admin';
        const isOwner = reservation.userId._id.toString() === req.user._id.toString();
        const isRequestingReturn = req.body.status === 'RETURN_PENDING';

        // Students can only request returns on their own approved reservations
        if (!isAdmin) {
            if (!isOwner) {
                return res.status(403).json({ 
                    message: 'Not authorized. Students can only request return of their own items.' 
                });
            }
            if (!isRequestingReturn) {
                return res.status(403).json({ 
                    message: 'Students can only request returns, not change other statuses.' 
                });
            }
            if (reservation.status !== 'APPROVED') {
                return res.status(400).json({ 
                    message: 'Can only request return for approved items' 
                });
            }
        }

        const item = await Item.findById(reservation.itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const oldStatus = reservation.status;
        const newStatus = req.body.status;
        reservation.status = newStatus;
        
        // Include quantity in the update if provided
        if (req.body.quantity !== undefined) {
            reservation.quantity = req.body.quantity;
        }
        
        await reservation.save();

        // Update item reserved count based on status change
        if (oldStatus === 'PENDING' && newStatus === 'REJECTED') {
            item.reserved = Math.max(0, item.reserved - (reservation.quantity || 1));
            await item.save();
        } else if (oldStatus === 'RETURN_PENDING' && newStatus === 'RETURNED') {
            // Admin approved the return
            item.reserved = Math.max(0, item.reserved - (reservation.quantity || 1));
            await item.save();
        }

        res.json(reservation);
    } catch (error) {
        console.error('Error updating reservation:', error);
        res.status(400).json({ message: error.message });
    }
});

// Delete reservation (admin can delete any, students can only delete their own)
router.delete('/:id', auth, async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate('userId');
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Check if user is authorized to delete this reservation
        if (req.user.role !== 'admin' && reservation.userId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this reservation' });
        }

        // Update item's reserved count
        const item = await Item.findById(reservation.itemId);
        if (item) {
            item.reserved = Math.max(0, item.reserved - 1); // Ensure it doesn't go below 0
            await item.save();
        }

        await Reservation.findByIdAndDelete(req.params.id);
        res.json({ message: 'Reservation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Archive reservation (admin only)
router.patch('/:id/archive', auth, adminOnly, async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Only allow archiving of returned reservations
        if (reservation.status !== 'RETURNED') {
            return res.status(400).json({ message: 'Can only archive returned reservations' });
        }

        reservation.status = 'ARCHIVED';
        await reservation.save();

        res.json({ message: 'Reservation archived successfully' });
    } catch (error) {
        console.error('Error archiving reservation:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;