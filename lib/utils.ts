import { User, UserPreferences, Card } from '@/types';

/**
 * Calculate compatibility score between two users based on shared interests
 */
export const calculateCompatibilityScore = (
  userPrefs: UserPreferences,
  targetPrefs: UserPreferences
): number => {
  const categories = ['music', 'hobbies', 'movies', 'books', 'popCulture', 'education', 'career'];
  let sharedCount = 0;
  let totalCount = 0;

  categories.forEach((category) => {
    const userItems = (userPrefs[category as keyof UserPreferences] as string[]) || [];
    const targetItems = (targetPrefs[category as keyof UserPreferences] as string[]) || [];
    
    const shared = userItems.filter(item => targetItems.includes(item)).length;
    sharedCount += shared;
    totalCount += Math.max(userItems.length, targetItems.length);
  });

  return totalCount > 0 ? Math.round((sharedCount / totalCount) * 100) : 0;
};

/**
 * Filter cards based on user preferences and distance
 */
export const filterCardsByPreferences = (
  cards: Card[],
  preferences: UserPreferences
): Card[] => {
  return cards.filter(card => card.compatibilityScore >= 30);
};

/**
 * Format hashtags from text
 */
export const extractHashtags = (text: string): string[] => {
  const hashtags = text.match(/#\w+/g) || [];
  return hashtags.map(tag => tag.toLowerCase());
};

/**
 * Validate age verification
 */
export const validateAgeVerification = (age: number, idDocument: File): boolean => {
  return age >= 18 && idDocument.size > 0;
};

/**
 * Check if photos are blocked based on last interaction time
 */
export const arePhotosBlocked = (lastPhotosBlockedAt?: Date): boolean => {
  if (!lastPhotosBlockedAt) return false;
  
  const now = new Date();
  const daysSinceBlock = (now.getTime() - lastPhotosBlockedAt.getTime()) / (1000 * 60 * 60 * 24);
  
  return daysSinceBlock < 3; // Photos blocked for 3 days
};

/**
 * Flag suspicious user behavior
 */
export const flagUserBehavior = (
  ratedUserId: string,
  reason: string
): boolean => {
  const inappropriateKeywords = ['harassment', 'abuse', 'spam', 'explicit'];
  return inappropriateKeywords.some(keyword => reason.toLowerCase().includes(keyword));
};
