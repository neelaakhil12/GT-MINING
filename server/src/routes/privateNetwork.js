import express from 'express';
import { readDB, writeDB, generateId } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to get or build persistent circle data from real referrals
function getOrCreateCircle(db, userId, userName) {
  if (!db.privateNetworks) {
    db.privateNetworks = {};
  }

  // Real referrals from database
  const userReferrals = (db.referrals || []).filter(r => r.referrerUserId === userId);
  const now = Date.now();
  const cooldownMs = 14400 * 1000; // 4 hours

  const members = userReferrals.map((ref, idx) => {
    const friend = (db.users || []).find(u => u.id === ref.referredUserId && !u.deletedAt);
    const lastClaimMs = friend && friend.lastMiningAt ? new Date(friend.lastMiningAt).getTime() : 0;
    const nextEligibleMs = lastClaimMs > 0 ? lastClaimMs + cooldownMs : 0;
    const isEligible = nextEligibleMs <= now;
    const friendName = friend ? friend.fullName : 'GT Pioneer';
    const initials = friendName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const maskedId = friend?.referralCode || `GT-${ref.id.slice(-4)}`;
    const email = friend ? friend.email.replace(/(.{2})(.*)(?=@)/, '$1***') : '***@***.com';

    return {
      id: `pn_mem_${userId}_${idx + 1}`,
      userId: ref.referredUserId,
      name: friendName,
      maskedId,
      email,
      initials,
      avatarColor: 'from-[#10B981] to-[#059669]',
      isMiningActive: !isEligible && lastClaimMs > 0,
      lastMiningAt: friend?.lastMiningAt || null,
      nextEligibleAt: nextEligibleMs > 0 ? new Date(nextEligibleMs).toISOString() : null,
      totalMined: Number(ref.rewardAmount || 0),
      streakDays: lastClaimMs > 0 ? 1 : 0,
      activityStatus: (!isEligible && lastClaimMs > 0) ? 'MINING' : 'IDLE',
      lastPingedAt: null,
    };
  });

  if (!db.privateNetworks[userId]) {
    db.privateNetworks[userId] = {
      circleHostId: userId,
      messages: [],
      createdAt: new Date().toISOString(),
    };
    writeDB(db);
  }

  return {
    circleHostId: userId,
    members,
    messages: db.privateNetworks[userId].messages || [],
    createdAt: db.privateNetworks[userId].createdAt || new Date().toISOString(),
  };
}

// GET /api/private-network
router.get('/', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const circle = getOrCreateCircle(db, user.id, user.fullName);
    const activeMiningCount = circle.members.filter(m => m.isMiningActive).length;
    const idleCount = circle.members.length - activeMiningCount;

    return res.json({
      success: true,
      circleHost: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        referralCode: user.referralCode,
        totalReferrals: circle.members.length,
      },
      members: circle.members,
      messages: circle.messages,
      stats: {
        totalMembers: circle.members.length,
        activeMiningCount,
        idleCount,
      },
    });
  } catch (err) {
    console.error('Error in GET /api/private-network:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve private network data.' });
  }
});

// POST /api/private-network/messages
router.post('/messages', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { text, type = 'CHAT', targetMemberId, targetMemberName } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text cannot be empty.' });
    }

    const circle = getOrCreateCircle(db, user.id, user.fullName);
    const newMessage = {
      id: generateId('msg'),
      circleId: user.id,
      senderId: user.id,
      senderName: user.fullName,
      senderRole: 'HOST',
      senderAvatar: user.fullName.charAt(0).toUpperCase(),
      text: text.trim(),
      type,
      targetMemberId: targetMemberId || null,
      targetMemberName: targetMemberName || null,
      createdAt: new Date().toISOString(),
    };

    if (!db.privateNetworks[user.id]) {
      db.privateNetworks[user.id] = { circleHostId: user.id, messages: [] };
    }
    if (!db.privateNetworks[user.id].messages) {
      db.privateNetworks[user.id].messages = [];
    }
    db.privateNetworks[user.id].messages.push(newMessage);

    // If message is a reminder or alert, record an authoritative notification
    if (type === 'REMINDER' || text.toLowerCase().includes('mine') || text.toLowerCase().includes('reminder')) {
      db.notifications.push({
        id: generateId('notif'),
        userId: user.id,
        title: 'Mining Reminder Broadcast',
        message: `You posted a mining reminder in your Private Network: "${text.trim().substring(0, 80)}..."`,
        type: 'MINING',
        readAt: null,
        createdAt: new Date().toISOString(),
      });
    }

    writeDB(db);

    return res.json({
      success: true,
      message: newMessage,
    });
  } catch (err) {
    console.error('Error in POST /api/private-network/messages:', err);
    return res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
});

// POST /api/private-network/ping-member
router.post('/ping-member', requireAuth, (req, res) => {
  try {
    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { memberId, memberName } = req.body;
    if (!memberId) {
      return res.status(400).json({ success: false, message: 'Member ID is required.' });
    }

    const circle = getOrCreateCircle(db, user.id, user.fullName);
    const member = circle.members.find(m => m.id === memberId);
    if (member) {
      member.lastPingedAt = new Date().toISOString();
    }

    const pingText = `⏰ @${memberName || member?.name || 'Member'}, your 4-Hour GT Mining session is ready! Tap 'Mine Now' to claim your 1.00 GT reward and keep our team's hash rate at 100%.`;

    const alertMessage = {
      id: generateId('msg'),
      circleId: user.id,
      senderId: user.id,
      senderName: user.fullName,
      senderRole: 'HOST',
      senderAvatar: user.fullName.charAt(0).toUpperCase(),
      text: pingText,
      type: 'REMINDER',
      targetMemberId: memberId,
      targetMemberName: memberName || member?.name,
      createdAt: new Date().toISOString(),
    };

    if (!db.privateNetworks[user.id]) {
      db.privateNetworks[user.id] = { circleHostId: user.id, messages: [] };
    }
    if (!db.privateNetworks[user.id].messages) {
      db.privateNetworks[user.id].messages = [];
    }
    db.privateNetworks[user.id].messages.push(alertMessage);

    // Add notification
    db.notifications.push({
      id: generateId('notif'),
      userId: user.id,
      title: `Mining Ping Sent to ${memberName || member?.name}`,
      message: `Your reminder was delivered to ${memberName || member?.name} in your Private Network.`,
      type: 'MINING',
      readAt: null,
      createdAt: new Date().toISOString(),
    });

    writeDB(db);

    return res.json({
      success: true,
      message: alertMessage,
      member,
    });
  } catch (err) {
    console.error('Error in POST /api/private-network/ping-member:', err);
    return res.status(500).json({ success: false, message: 'Failed to ping member.' });
  }
});

export default router;
