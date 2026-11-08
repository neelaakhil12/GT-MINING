import express from 'express';
import { readDB, writeDB, generateId } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Determine which circle a user belongs to and retrieve its host, members, and messages.
 * If user was referred by someone (e.g. ramuj was referred by rajesh), user is a member of that circle.
 * If user has no referrer, user is the host of their own circle.
 */
function resolveCircle(db, currentUser) {
  if (!db.privateNetworks) {
    db.privateNetworks = {};
  }

  // 1. Check if currentUser was referred by someone
  const userReferralRecord = (db.referrals || []).find(r => r.referredUserId === currentUser.id);
  const referrerUserId = currentUser.referredByUserId || userReferralRecord?.referrerUserId;
  const referrerUser = referrerUserId ? (db.users || []).find(u => u.id === referrerUserId && !u.deletedAt) : null;

  // 2. Check users directly referred by currentUser
  const myReferrals = (db.referrals || []).filter(r => r.referrerUserId === currentUser.id);

  // Determine circleHost:
  let circleHost = currentUser;
  let isCurrentUserHost = true;

  if (referrerUser) {
    circleHost = referrerUser;
    isCurrentUserHost = false;
  }

  const circleHostId = circleHost.id;

  // Ensure persistent circle record exists for this host
  if (!db.privateNetworks[circleHostId]) {
    db.privateNetworks[circleHostId] = {
      circleHostId,
      messages: [],
      createdAt: new Date().toISOString(),
    };
  }

  const now = Date.now();
  const cooldownMs = 14400 * 1000; // 4 hours

  // Helper to build a member item
  function buildMemberObj(userObj, roleLabel, isHost = false, refReward = 0) {
    const lastClaimMs = userObj.lastMiningAt ? new Date(userObj.lastMiningAt).getTime() : 0;
    const nextEligibleMs = lastClaimMs > 0 ? lastClaimMs + cooldownMs : 0;
    const isMiningActive = nextEligibleMs > now && lastClaimMs > 0;
    const name = userObj.fullName || 'GT Pioneer';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const maskedId = userObj.referralCode || `GT-${userObj.id.slice(-4)}`;
    const email = userObj.email ? userObj.email.replace(/(.{2})(.*)(?=@)/, '$1***') : '***@***.com';

    let totalMined = refReward;
    if (isHost) {
      const hostWallet = (db.wallets || []).find(w => w.userId === userObj.id);
      totalMined = Number(hostWallet?.availableBalance || 0);
    }

    return {
      id: `pn_mem_${userObj.id}`,
      userId: userObj.id,
      name: name,
      maskedId,
      email,
      initials,
      avatarColor: isHost ? 'from-[#F59E0B] to-[#D97706]' : 'from-[#10B981] to-[#059669]',
      avatarBg: isHost ? '#F59E0B' : '#10B981',
      isMiningActive,
      lastMiningAt: userObj.lastMiningAt || null,
      nextEligibleAt: nextEligibleMs > 0 ? new Date(nextEligibleMs).toISOString() : null,
      totalMined,
      streakDays: lastClaimMs > 0 ? 1 : 0,
      activityStatus: isMiningActive ? 'MINING' : 'IDLE',
      isHost,
      role: roleLabel,
      lastPingedAt: null,
    };
  }

  // All members of the host's circle:
  const hostReferrals = (db.referrals || []).filter(r => r.referrerUserId === circleHostId);
  const referredUserIds = hostReferrals.map(r => r.referredUserId);

  // If currentUser has their own referrals as well, include them in the circle
  myReferrals.forEach(r => {
    if (!referredUserIds.includes(r.referredUserId)) {
      referredUserIds.push(r.referredUserId);
    }
  });

  const memberList = [];

  // If viewing user is NOT the host, show the Host as the leader in their circle members list
  if (!isCurrentUserHost) {
    memberList.push(buildMemberObj(circleHost, 'HOST', true));
  }

  // Add the referred miners (excluding currentUser from their own member list)
  referredUserIds.forEach(id => {
    if (id === currentUser.id) {
      return;
    }
    const friend = (db.users || []).find(u => u.id === id && !u.deletedAt);
    if (friend) {
      const refEntry = (db.referrals || []).find(r => r.referredUserId === id);
      memberList.push(buildMemberObj(friend, 'MEMBER', false, Number(refEntry?.rewardAmount || 0)));
    }
  });

  const activeMiningCount = memberList.filter(m => m.isMiningActive).length;
  const idleCount = memberList.length - activeMiningCount;

  return {
    circleHostId,
    circleHost: {
      id: circleHost.id,
      fullName: circleHost.fullName,
      email: circleHost.email,
      referralCode: circleHost.referralCode,
      isCurrentUserHost,
    },
    members: memberList,
    messages: db.privateNetworks[circleHostId].messages || [],
    stats: {
      totalMembers: memberList.length,
      activeMiningCount,
      idleCount,
    },
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

    const circle = resolveCircle(db, user);

    return res.json({
      success: true,
      circleHost: circle.circleHost,
      members: circle.members,
      messages: circle.messages,
      stats: circle.stats,
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

    const circle = resolveCircle(db, user);
    const senderRole = user.id === circle.circleHostId ? 'HOST' : 'MEMBER';

    const newMessage = {
      id: generateId('msg'),
      circleId: circle.circleHostId,
      senderId: user.id,
      senderName: user.fullName,
      senderRole,
      senderAvatar: user.fullName.charAt(0).toUpperCase(),
      text: text.trim(),
      type,
      targetMemberId: targetMemberId || null,
      targetMemberName: targetMemberName || null,
      createdAt: new Date().toISOString(),
    };

    if (!db.privateNetworks[circle.circleHostId]) {
      db.privateNetworks[circle.circleHostId] = {
        circleHostId: circle.circleHostId,
        messages: [],
        createdAt: new Date().toISOString(),
      };
    }
    if (!db.privateNetworks[circle.circleHostId].messages) {
      db.privateNetworks[circle.circleHostId].messages = [];
    }
    db.privateNetworks[circle.circleHostId].messages.push(newMessage);

    // If message is a reminder or alert, broadcast notification to other circle members
    if (type === 'REMINDER' || text.toLowerCase().includes('mine') || text.toLowerCase().includes('reminder')) {
      circle.members.forEach(m => {
        if (m.userId && m.userId !== user.id) {
          db.notifications.push({
            id: generateId('notif'),
            userId: m.userId,
            title: `Circle Mining Alert from ${user.fullName}`,
            message: text.trim(),
            type: 'MINING',
            readAt: null,
            createdAt: new Date().toISOString(),
          });
        }
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

    const circle = resolveCircle(db, user);
    const member = circle.members.find(m => m.id === memberId || m.userId === memberId);
    if (member) {
      member.lastPingedAt = new Date().toISOString();
    }

    const pingText = `⏰ @${memberName || member?.name || 'Member'}, your 4-Hour GT Mining session is ready! Tap 'Mine Now' to claim your 1.00 GT reward and keep our team's hash rate at 100%.`;

    const alertMessage = {
      id: generateId('msg'),
      circleId: circle.circleHostId,
      senderId: user.id,
      senderName: user.fullName,
      senderRole: user.id === circle.circleHostId ? 'HOST' : 'MEMBER',
      senderAvatar: user.fullName.charAt(0).toUpperCase(),
      text: pingText,
      type: 'REMINDER',
      targetMemberId: memberId,
      targetMemberName: memberName || member?.name,
      createdAt: new Date().toISOString(),
    };

    if (!db.privateNetworks[circle.circleHostId]) {
      db.privateNetworks[circle.circleHostId] = {
        circleHostId: circle.circleHostId,
        messages: [],
        createdAt: new Date().toISOString(),
      };
    }
    if (!db.privateNetworks[circle.circleHostId].messages) {
      db.privateNetworks[circle.circleHostId].messages = [];
    }
    db.privateNetworks[circle.circleHostId].messages.push(alertMessage);

    // Send notification to the pinged member
    const targetUserId = member?.userId || (memberId.startsWith('pn_mem_') ? memberId.replace('pn_mem_', '') : memberId);
    if (targetUserId && targetUserId !== user.id) {
      db.notifications.push({
        id: generateId('notif'),
        userId: targetUserId,
        title: `Mining Reminder from ${user.fullName}`,
        message: `${user.fullName} pinged you to activate your 4-hour GT mining cycle!`,
        type: 'MINING',
        readAt: null,
        createdAt: new Date().toISOString(),
      });
    }

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
