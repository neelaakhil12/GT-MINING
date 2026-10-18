import express from 'express';
import { readDB, writeDB } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/notifications
router.get('/', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const notifications = db.notifications
      .filter(n => n.userId === req.user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const unreadCount = notifications.filter(n => !n.readAt).length;

    return res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const notification = db.notifications.find(n => n.id === req.params.id && n.userId === req.user.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    notification.readAt = new Date().toISOString();
    writeDB(db);

    return res.json({
      success: true,
      message: 'Notification marked as read.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
});

// POST /api/notifications/mark-all-read
router.post('/mark-all-read', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const now = new Date().toISOString();

    db.notifications.forEach(n => {
      if (n.userId === req.user.id && !n.readAt) {
        n.readAt = now;
      }
    });

    writeDB(db);

    return res.json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to mark all notifications as read.' });
  }
});

export default router;
