import express from 'express';
import { readDB, writeDB, generateId } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/tasks - Public active tasks
router.get('/', (req, res) => {
  try {
    const db = readDB();
    const tasks = (db.tasks || []).filter(t => t.isActive !== false);
    return res.json({ success: true, tasks });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch tasks.' });
  }
});

// GET /api/tasks/my-submissions - User's own submitted tasks & statuses
router.get('/my-submissions', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const userId = req.user.id;
    const submissions = (db.taskSubmissions || [])
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    return res.json({
      success: true,
      submissions
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch task submissions.' });
  }
});

// POST /api/tasks/submit-proof - User uploads screenshot proof of task completion
router.post('/submit-proof', requireAuth, (req, res) => {
  try {
    const { taskId, proofImage, proofNote } = req.body;

    if (!taskId) {
      return res.status(400).json({ success: false, message: 'Task ID is required.' });
    }

    if (!proofImage) {
      return res.status(400).json({ success: false, message: 'Please upload a screenshot proof of task completion.' });
    }

    const db = readDB();
    if (!db.taskSubmissions) db.taskSubmissions = [];

    // Find the task
    const task = (db.tasks || []).find(t => t.id === taskId);
    const taskTitle = task ? task.title : 'Social Quest Task';
    const reward = task ? Number(task.reward || 1) : 1;
    const category = task ? (task.category || 'social') : 'social';

    const userId = req.user.id;
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check if user already has an APPROVED submission for this task
    const alreadyApproved = db.taskSubmissions.find(s => s.userId === userId && s.taskId === taskId && s.status === 'APPROVED');
    if (alreadyApproved) {
      return res.status(400).json({
        success: false,
        message: 'You have already completed this task and claimed your reward!'
      });
    }

    // Check if user has an existing PENDING submission
    const existingPending = db.taskSubmissions.find(s => s.userId === userId && s.taskId === taskId && s.status === 'PENDING');
    if (existingPending) {
      // Update existing pending proof
      existingPending.proofImage = proofImage;
      existingPending.proofNote = proofNote || existingPending.proofNote || '';
      existingPending.submittedAt = new Date().toISOString();
      writeDB(db);
      return res.json({
        success: true,
        message: 'Your proof was updated and is currently pending administrator verification.',
        submission: existingPending
      });
    }

    const newSubmission = {
      id: generateId('sub'),
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      taskId,
      taskTitle,
      taskCategory: category,
      reward,
      proofImage,
      proofNote: proofNote || '',
      status: 'PENDING', // 'PENDING' | 'APPROVED' | 'REJECTED'
      adminComment: '',
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null
    };

    db.taskSubmissions.push(newSubmission);
    writeDB(db);

    return res.status(201).json({
      success: true,
      message: 'Proof submitted successfully! Admin will review your proof and credit your wallet.',
      submission: newSubmission
    });
  } catch (err) {
    console.error('Task submission error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit task proof.' });
  }
});

export default router;

