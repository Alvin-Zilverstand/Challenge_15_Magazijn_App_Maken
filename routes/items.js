const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth, adminOnly } = require('../middleware/auth');
const Item = require('../models/Item');
const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/items/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'item-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    }
});

// Get all items
router.get('/', auth, async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single item by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new item (admin only)
router.post('/', auth, adminOnly, upload.single('image'), async (req, res) => {
    try {
        const itemData = {
            name: req.body.name,
            description: req.body.description,
            location: req.body.location,
            quantity: parseInt(req.body.quantity)
        };

        // If an image was uploaded, set the imageUrl
        if (req.file) {
            itemData.imageUrl = `/images/items/${req.file.filename}`;
        }

        const item = new Item(itemData);
        await item.save();
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update item (admin only)
router.put('/:id', auth, adminOnly, upload.single('image'), async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            description: req.body.description,
            location: req.body.location,
            quantity: parseInt(req.body.quantity)
        };

        // If an image was uploaded, set the new imageUrl
        if (req.file) {
            updateData.imageUrl = `/images/items/${req.file.filename}`;
        } else if (req.body.imageUrl !== undefined) {
            // If imageUrl is explicitly provided (including empty string for removal)
            updateData.imageUrl = req.body.imageUrl || '/images/default-item.png';
        }

        const item = await Item.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete item (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const item = await Item.findByIdAndDelete(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;