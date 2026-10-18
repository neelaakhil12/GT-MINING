import express from 'express';
import { readDB } from '../db.js';

const router = express.Router();

// GET /api/community/posts
router.get('/posts', (req, res) => {
  try {
    const db = readDB();
    const { category, search } = req.query;

    let posts = db.communityPosts.filter(p => p.status === 'PUBLISHED');

    if (category && category !== 'All') {
      posts = posts.filter(p => p.category?.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }

    // Sort: pinned posts first, then newest first
    posts.sort((a, b) => {
      if (b.isPinned && !a.isPinned) return 1;
      if (!b.isPinned && a.isPinned) return -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return res.json({
      success: true,
      posts
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve community feed.' });
  }
});

// GET /api/community/posts/:id
router.get('/posts/:id', (req, res) => {
  try {
    const db = readDB();
    const post = db.communityPosts.find(p => p.id === req.params.id && p.status === 'PUBLISHED');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    return res.json({
      success: true,
      post
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve post.' });
  }
});

export default router;
