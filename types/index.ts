// User & Authentication Types
export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  age: number;
  birthDate?: Date;
  isAgeVerified: boolean;
  selfDescription: string; // Hidden, used for algorithm
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  lastPhotosBlockedAt?: Date; // Photo visibility timer

  // Location (used for matching & event suggestions)
  latitude?: number | null;
  longitude?: number | null;
  city?: string | null;
  country?: string | null;

  // Age preference range for matching
  ageMin?: number | null;
  ageMax?: number | null;
}

export interface UserPreferences {
  userId: string;
  music: string[];
  hobbies: string[];
  movies: string[];
  books: string[];
  popCulture: string[];
  education: string[];
  career: string[];
}

export interface UserOpinion {
  id: string;
  userId: string;
  content: string;
  hashtags: string[]; // hashtag-like system
  relatedEventId?: string;
  relatedEventName?: string;
  isAboutPastEvent: boolean;
  createdAt: Date;
  likes: number;
}

// Event Types
export interface Event {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  description: string;
  category: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
  };
  startDate: Date;
  endDate: Date;
  hashtags: string[];
  attendees: string[]; // User IDs
  maxAttendees?: number;
  isPersonal: boolean; // Personal events created by users
  discountPercentage?: number; // For commission-based advertising
  coverImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Rating & Review Types
export interface EventRating {
  id: string;
  eventId: string;
  userId: string;
  rating: number; // 1-5
  review: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizerRating {
  id: string;
  organizerId: string;
  userId: string;
  rating: number; // 1-5
  review: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserBehaviorRating {
  id: string;
  ratedUserId: string;
  raterUserId: string;
  rating: number; // 1-5
  behavior: string; // Description of behavior
  isFlagged: boolean; // System flagging for review
  flagReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Report Types
export interface Report {
  id: string;
  reportedUserId: string;
  reporterUserId: string;
  reason: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

// Card Swiping Types
export interface Card {
  user: User;
  preferences: UserPreferences;
  mutualInterests: string[];
  compatibilityScore: number; // 0-100
}

// ─── Chat & Conversation Types ────────────────────────────────────────────────

export type ChatFeature =
  | 'text'
  | 'emoji'
  | 'gif'
  | 'image'
  | 'video'
  | 'voice_call'
  | 'video_call'
  | 'event_suggestion';

export type MessageType = 'text' | 'emoji' | 'gif' | 'image' | 'video' | 'voice_note' | 'system';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  sender: { id: string; name: string; profileImageUrl?: string | null };
  type: MessageType;
  content: string;
  xpAwarded: number;
  createdAt: Date;
}

export interface ConversationPartner {
  id: string;
  name: string;
  profileImageUrl?: string | null;
  age: number;
  city?: string | null;
}

export interface Conversation {
  id: string;
  partner: ConversationPartner;
  level: number;
  totalXp: number;
  unlockedFeatures: ChatFeature[];
  lastMessage?: ChatMessage | null;
  lastMessageAt?: Date | null;
  createdAt: Date;
}

export interface ChatLevelInfo {
  level: number;
  totalXp: number;
  nextLevel: { level: number; xpNeeded: number } | null;
  unlockedFeatures: ChatFeature[];
  nextUnlock: { feature: ChatFeature; atLevel: number } | null;
  eventSuggestionEligible: boolean;
  myXpToday: number;
  myXpThisHour: number;
}

// Search Types
export interface HashtagSearch {
  hashtag: string;
  eventCount: number;
  userOpinionCount: number;
  relatedTopics: string[];
}
