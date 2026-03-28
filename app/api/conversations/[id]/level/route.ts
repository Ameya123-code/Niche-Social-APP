import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import {
  getLevelFromXp,
  getXpToNextLevel,
  getUnlockedFeatures,
  FEATURE_UNLOCK_LEVELS,
  canSuggestEvents,
} from '@/lib/chat-level';

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/conversations/[id]/level
 * Returns the conversation level, XP progress, unlocked features, and next unlock info.
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: convId } = await params;

    const conv = await prisma.conversation.findFirst({
      where: {
        id: convId,
        OR: [{ userAId: authUser.userId }, { userBId: authUser.userId }],
      },
      include: {
        level: true,
        userA: { select: { id: true, age: true, latitude: true, city: true } },
        userB: { select: { id: true, age: true, latitude: true, city: true } },
      },
    });

    if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

    const totalXp = conv.level?.totalXp ?? 0;
    const level = conv.level?.level ?? getLevelFromXp(totalXp);
    const nextLevelInfo = getXpToNextLevel(totalXp);
    const unlocked = getUnlockedFeatures(level);

    // Determine the next locked feature and what level it's at
    const nextLocked = (Object.entries(FEATURE_UNLOCK_LEVELS) as [string, number][])
      .filter(([, minLevel]) => minLevel > level)
      .sort((a, b) => a[1] - b[1])[0] ?? null;

    // Event suggestion eligibility
    const eventSuggestionEligible =
      unlocked.includes('event_suggestion') &&
      canSuggestEvents(conv.userA.age, conv.userB.age, conv.userA.latitude, conv.userB.latitude);

    // My anti-spam status
    const myXp = await prisma.userConversationXp.findUnique({
      where: { userId_conversationId: { userId: authUser.userId, conversationId: convId } },
      select: { xpThisHour: true, xpToday: true },
    });

    return NextResponse.json({
      level,
      totalXp,
      nextLevel: nextLevelInfo
        ? { level: nextLevelInfo.nextLevel, xpNeeded: nextLevelInfo.xpNeeded }
        : null,
      unlockedFeatures: unlocked,
      nextUnlock: nextLocked ? { feature: nextLocked[0], atLevel: nextLocked[1] } : null,
      eventSuggestionEligible,
      myXpToday: myXp?.xpToday ?? 0,
      myXpThisHour: myXp?.xpThisHour ?? 0,
    });
  } catch (error) {
    console.error('GET /api/conversations/[id]/level error:', error);
    return NextResponse.json({ error: 'Failed to fetch level' }, { status: 500 });
  }
}
