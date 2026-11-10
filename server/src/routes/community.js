import express from 'express';
import { readDB, writeDB, generateId } from '../db.js';

const router = express.Router();

// GET /api/community/posts
router.get('/posts', (req, res) => {
  try {
    const db = readDB();
    const { category, search } = req.query;

    const rawPosts = Array.isArray(db.communityPosts) ? db.communityPosts : [];
    const allComments = Array.isArray(db.communityComments) ? db.communityComments : [];
    let posts = rawPosts.filter(p => p.status === 'PUBLISHED');

    // Dynamically compute authoritative likesCount and commentsCount for every post
    posts = posts.map(p => {
      const postComments = allComments.filter(c => c.postId === p.id);
      const likedBy = Array.isArray(p.likedBy) ? p.likedBy : [];
      const likesCount = Math.max(likedBy.length, Number(p.likesCount !== undefined ? p.likesCount : 0));
      const commentsCount = postComments.length > 0 ? postComments.length : Number(p.commentsCount || 0);
      const viewsCount = Math.max(0, Number(p.viewsCount || 0));
      return {
        ...p,
        likedBy,
        likesCount,
        commentsCount,
        viewsCount
      };
    });

    if (category && category.toLowerCase() === 'latest') {
      // Latest: Sort strictly newest first by updatedAt or createdAt
      posts.sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt).getTime();
        return timeB - timeA;
      });
    } else if (category && category !== 'All') {
      posts = posts.filter(p => p.category?.toLowerCase() === category.toLowerCase());
      posts.sort((a, b) => {
        if (b.isPinned && !a.isPinned) return 1;
        if (!b.isPinned && a.isPinned) return -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } else {
      // All: Sort pinned first, then newest first
      posts.sort((a, b) => {
        if (b.isPinned && !a.isPinned) return 1;
        if (!b.isPinned && a.isPinned) return -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      posts = posts.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }

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
    const rawPosts = Array.isArray(db.communityPosts) ? db.communityPosts : [];
    const post = rawPosts.find(p => p.id === req.params.id && p.status === 'PUBLISHED');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const likesCount = Math.max(post.likedBy?.length || 0, Number(post.likesCount !== undefined ? post.likesCount : 0));
    const viewsCount = Math.max(0, Number(post.viewsCount || 0));

    return res.json({
      success: true,
      post: {
        ...post,
        likesCount,
        viewsCount
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve post.' });
  }
});

// POST /api/community/posts/:id/like - Persistent toggle like with database saving
router.post('/posts/:id/like', (req, res) => {
  try {
    const db = readDB();
    if (!Array.isArray(db.communityPosts)) {
      db.communityPosts = [];
    }

    const post = db.communityPosts.find(p => p.id === req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (!Array.isArray(post.likedBy)) {
      post.likedBy = [];
    }

    const userId = req.body.userId || req.headers['x-user-id'] || 'miner_guest';
    const alreadyLikedIndex = post.likedBy.indexOf(userId);
    let isLiked = false;
    const baseLikes = Math.max(0, Number(post.likesCount !== undefined ? post.likesCount : post.likedBy.length));

    if (alreadyLikedIndex !== -1) {
      // Unlike
      post.likedBy.splice(alreadyLikedIndex, 1);
      post.likesCount = Math.max(0, baseLikes - 1);
      isLiked = false;
    } else {
      // Like
      post.likedBy.push(userId);
      post.likesCount = baseLikes + 1;
      isLiked = true;
    }

    writeDB(db);

    return res.json({
      success: true,
      isLiked,
      likesCount: post.likesCount,
      likedBy: post.likedBy
    });
  } catch (err) {
    console.error('Like error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update like status.' });
  }
});

// POST /api/community/posts/:id/view - Register or increment post view count
router.post('/posts/:id/view', (req, res) => {
  try {
    const db = readDB();
    if (!Array.isArray(db.communityPosts)) {
      db.communityPosts = [];
    }
    const post = db.communityPosts.find(p => p.id === req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }
    post.viewsCount = Math.max(0, Number(post.viewsCount || 0)) + 1;
    writeDB(db);
    return res.json({
      success: true,
      viewsCount: post.viewsCount
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to record view.' });
  }
});

// GET /api/community/posts/:id/comments - Retrieve all comments from database
router.get('/posts/:id/comments', (req, res) => {
  try {
    const db = readDB();
    if (!Array.isArray(db.communityComments)) {
      db.communityComments = [];
    }

    const comments = db.communityComments
      .filter(c => c.postId === req.params.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return res.json({
      success: true,
      comments,
      total: comments.length
    });
  } catch (err) {
    console.error('Get comments error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve comments.' });
  }
});

// POST /api/community/posts/:id/comments - Post a new comment and save to database
router.post('/posts/:id/comments', (req, res) => {
  try {
    const { content, userName, userId } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty.' });
    }

    const db = readDB();
    if (!Array.isArray(db.communityPosts)) {
      db.communityPosts = [];
    }

    const post = db.communityPosts.find(p => p.id === req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (!Array.isArray(db.communityComments)) {
      db.communityComments = [];
    }

    const now = new Date().toISOString();
    const newComment = {
      id: generateId('cmt'),
      postId: req.params.id,
      userId: userId || 'usr_guest',
      userName: userName ? userName.trim() : 'GT Miner',
      content: content.trim(),
      createdAt: now,
      updatedAt: now
    };

    db.communityComments.push(newComment);

    // Update post comments count in DB
    post.commentsCount = db.communityComments.filter(c => c.postId === req.params.id).length;
    post.updatedAt = now;

    writeDB(db);

    return res.json({
      success: true,
      message: 'Comment posted successfully!',
      comment: newComment,
      commentsCount: post.commentsCount
    });
  } catch (err) {
    console.error('Post comment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to post comment.' });
  }
});

// DELETE /api/community/posts/:id
router.delete('/posts/:id', (req, res) => {
  try {
    const db = readDB();
    if (!Array.isArray(db.communityPosts)) {
      db.communityPosts = [];
    }
    const index = db.communityPosts.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
      db.communityPosts.splice(index, 1);
      if (Array.isArray(db.communityComments)) {
        db.communityComments = db.communityComments.filter(c => c.postId !== req.params.id);
      }
      writeDB(db);
    }
    return res.json({ success: true, message: 'Post removed from community feed.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete post.' });
  }
});

export default router;
