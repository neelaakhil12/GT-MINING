import express from 'express';
import { readDB, writeDB, generateId } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const DEFAULT_MEMBERS_TEMPLATE = [
  {
    name: 'Rahul Varma',
    maskedId: 'GT-91****24',
    email: 'ra***@gmail.com',
    initials: 'RV',
    avatarColor: 'from-[#3B82F6] to-[#60A5FA]',
    isMiningActive: true,
    lastMiningOffsetMinutes: 45, // claimed 45 mins ago
    totalMined: 24.0,
    streakDays: 6,
  },
  {
    name: 'Priya Sharma',
    maskedId: 'GT-44****89',
    email: 'pr***@yahoo.com',
    initials: 'PS',
    avatarColor: 'from-[#EC4899] to-[#F472B6]',
    isMiningActive: false, // IDLE, ready to mine
    lastMiningOffsetMinutes: 310, // claimed 5h+ ago (past 4h cooldown)
    totalMined: 18.0,
    streakDays: 3,
  },
  {
    name: 'Arjun Reddy',
    maskedId: 'GT-77****12',
    email: 'ar***@outlook.com',
    initials: 'AR',
    avatarColor: 'from-[#10B981] to-[#34D399]',
    isMiningActive: true,
    lastMiningOffsetMinutes: 110, // claimed ~2h ago
    totalMined: 42.0,
    streakDays: 14,
  },
  {
    name: 'Kavya Nair',
    maskedId: 'GT-55****67',
    email: 'ka***@gmail.com',
    initials: 'KN',
    avatarColor: 'from-[#8B5CF6] to-[#A78BFA]',
    isMiningActive: false, // IDLE
    lastMiningOffsetMinutes: 480, // 8h ago
    totalMined: 8.0,
    streakDays: 1,
  },
  {
    name: 'Sneha Rao',
    maskedId: 'GT-23****45',
    email: 'sn***@gmail.com',
    initials: 'SR',
    avatarColor: 'from-[#F59E0B] to-[#FBBF24]',
    isMiningActive: true,
    lastMiningOffsetMinutes: 30, // claimed 30 mins ago
    totalMined: 31.0,
    streakDays: 9,
  },
  {
    name: 'Vikram Patel',
    maskedId: 'GT-88****31',
    email: 'vi***@hotmail.com',
    initials: 'VP',
    avatarColor: 'from-[#14B8A6] to-[#2DD4BF]',
    isMiningActive: false, // IDLE
    lastMiningOffsetMinutes: 380, // > 6h ago
    totalMined: 15.0,
    streakDays: 4,
  },
  {
    name: 'Elena Rostova',
    maskedId: 'GT-66****90',
    email: 'el***@crypto.net',
    initials: 'ER',
    avatarColor: 'from-[#06B6D4] to-[#22D3EE]',
    isMiningActive: true,
    lastMiningOffsetMinutes: 95,
    totalMined: 55.0,
    streakDays: 18,
  },
  {
    name: 'Deepak Gupta',
    maskedId: 'GT-33****58',
    email: 'de***@gmail.com',
    initials: 'DG',
    avatarColor: 'from-[#6366F1] to-[#818CF8]',
    isMiningActive: false, // IDLE
    lastMiningOffsetMinutes: 620, // > 10h ago
    totalMined: 5.0,
    streakDays: 1,
  },
  {
    name: 'Ananya Das',
    maskedId: 'GT-19****73',
    email: 'an***@gmail.com',
    initials: 'AD',
    avatarColor: 'from-[#D946EF] to-[#F0ABFC]',
    isMiningActive: true,
    lastMiningOffsetMinutes: 15,
    totalMined: 29.0,
    streakDays: 8,
  },
  {
    name: 'Rohit Verma',
    maskedId: 'GT-48****16',
    email: 'ro***@yahoo.com',
    initials: 'RV',
    avatarColor: 'from-[#84CC16] to-[#A3E635]',
    isMiningActive: true,
    lastMiningOffsetMinutes: 180,
    totalMined: 20.0,
    streakDays: 5,
  },
];

// Helper to get or build persistent circle data
function getOrCreateCircle(db, userId, userName) {
  if (!db.privateNetworks) {
    db.privateNetworks = {};
  }

  if (!db.privateNetworks[userId]) {
    const now = Date.now();
    const members = DEFAULT_MEMBERS_TEMPLATE.map((tpl, idx) => {
      const lastClaimMs = now - tpl.lastMiningOffsetMinutes * 60 * 1000;
      const cooldownMs = 14400 * 1000; // 4 hours
      const nextEligibleMs = lastClaimMs + cooldownMs;
      const isEligible = nextEligibleMs <= now;

      return {
        id: `pn_mem_${userId}_${idx + 1}`,
        name: tpl.name,
        maskedId: tpl.maskedId,
        email: tpl.email,
        initials: tpl.initials,
        avatarColor: tpl.avatarColor,
        isMiningActive: !isEligible,
        lastMiningAt: new Date(lastClaimMs).toISOString(),
        nextEligibleAt: new Date(nextEligibleMs).toISOString(),
        totalMined: tpl.totalMined,
        streakDays: tpl.streakDays,
        activityStatus: isEligible ? 'IDLE' : 'MINING',
        lastPingedAt: null,
      };
    });

    const messages = [
      {
        id: `msg_seed_1_${userId}`,
        circleId: userId,
        senderId: userId,
        senderName: userName || 'Host',
        senderRole: 'HOST',
        senderAvatar: (userName || 'H').charAt(0).toUpperCase(),
        text: '👋 Welcome everyone to our Private Mining Circle! Remember to claim your 1.00 GT every 4 hours so our team maintains 100% hash power uptime.',
        type: 'CHAT',
        createdAt: new Date(now - 7200000).toISOString(),
      },
      {
        id: `msg_seed_2_${userId}`,
        circleId: userId,
        senderId: `pn_mem_${userId}_1`,
        senderName: 'Rahul Varma',
        senderRole: 'MEMBER',
        senderAvatar: 'RV',
        text: 'Thanks for the invite! Just completed my 4-hour mining claim ⛏️ +1 GT credited.',
        type: 'CHAT',
        createdAt: new Date(now - 3600000).toISOString(),
      },
      {
        id: `msg_seed_3_${userId}`,
        circleId: userId,
        senderId: `pn_mem_${userId}_3`,
        senderName: 'Arjun Reddy',
        senderRole: 'MEMBER',
        senderAvatar: 'AR',
        text: 'Epoch synced! Ready for the next block cycle.',
        type: 'CHAT',
        createdAt: new Date(now - 1800000).toISOString(),
      },
    ];

    db.privateNetworks[userId] = {
      circleHostId: userId,
      members,
      messages,
      createdAt: new Date().toISOString(),
    };
    writeDB(db);
  }

  // Recalculate dynamic mining countdowns
  const circle = db.privateNetworks[userId];
  const now = Date.now();
  circle.members = circle.members.map(mem => {
    if (!mem.lastMiningAt) return mem;
    const lastClaimMs = new Date(mem.lastMiningAt).getTime();
    const nextEligibleMs = lastClaimMs + 14400 * 1000;
    const isEligible = nextEligibleMs <= now;
    return {
      ...mem,
      isMiningActive: !isEligible,
      activityStatus: isEligible ? 'IDLE' : 'MINING',
      nextEligibleAt: new Date(nextEligibleMs).toISOString(),
    };
  });

  return circle;
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

    circle.messages.push(newMessage);

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

    circle.messages.push(alertMessage);

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
