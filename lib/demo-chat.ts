export type DemoConversation = {
  id: string;
  partner: {
    id: string;
    name: string;
    age: number;
    city: string;
    profileImageUrl?: string | null;
  };
  level: number;
  totalXp: number;
  unlockedFeatures: string[];
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    type: string;
    createdAt: string;
  };
  lastMessageAt: string;
  createdAt: string;
};

export type DemoMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  sender: { id: string; name: string; profileImageUrl?: string | null };
  type: 'text' | 'emoji' | 'gif';
  content: string;
  xpAwarded: number;
  createdAt: string;
};

const now = Date.now();

export const DEMO_CONVERSATIONS: DemoConversation[] = [
  {
    id: 'demo_conv_1',
    partner: { id: 'demo_1', name: 'Aanya', age: 23, city: 'Mumbai' },
    level: 6,
    totalXp: 162,
    unlockedFeatures: ['text', 'emoji', 'gif'],
    lastMessage: {
      id: 'demo_last_1',
      content: 'Coffee + walk this Sunday?',
      senderId: 'demo_1',
      type: 'text',
      createdAt: new Date(now - 1000 * 60 * 10).toISOString(),
    },
    lastMessageAt: new Date(now - 1000 * 60 * 10).toISOString(),
    createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'demo_conv_2',
    partner: { id: 'demo_2', name: 'Rohan', age: 25, city: 'Pune' },
    level: 11,
    totalXp: 548,
    unlockedFeatures: ['text', 'emoji', 'gif', 'image'],
    lastMessage: {
      id: 'demo_last_2',
      content: 'That tech meetup looked insane 🔥',
      senderId: 'demo_2',
      type: 'text',
      createdAt: new Date(now - 1000 * 60 * 45).toISOString(),
    },
    lastMessageAt: new Date(now - 1000 * 60 * 45).toISOString(),
    createdAt: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
  },
];

export const DEMO_MESSAGES: Record<string, DemoMessage[]> = {
  demo_conv_1: [
    {
      id: 'd1',
      conversationId: 'demo_conv_1',
      senderId: 'demo_1',
      sender: { id: 'demo_1', name: 'Aanya' },
      type: 'text',
      content: 'You seem like someone who enjoys deep conversations 🙂',
      xpAwarded: 2,
      createdAt: new Date(now - 1000 * 60 * 120).toISOString(),
    },
    {
      id: 'd2',
      conversationId: 'demo_conv_1',
      senderId: 'me',
      sender: { id: 'me', name: 'You' },
      type: 'text',
      content: 'Definitely. Especially over coffee and long walks.',
      xpAwarded: 3,
      createdAt: new Date(now - 1000 * 60 * 118).toISOString(),
    },
    {
      id: 'd3',
      conversationId: 'demo_conv_1',
      senderId: 'demo_1',
      sender: { id: 'demo_1', name: 'Aanya' },
      type: 'text',
      content: 'Coffee + walk this Sunday?',
      xpAwarded: 3,
      createdAt: new Date(now - 1000 * 60 * 10).toISOString(),
    },
  ],
  demo_conv_2: [
    {
      id: 'd4',
      conversationId: 'demo_conv_2',
      senderId: 'demo_2',
      sender: { id: 'demo_2', name: 'Rohan' },
      type: 'text',
      content: 'You into startups or just tech memes? 😂',
      xpAwarded: 2,
      createdAt: new Date(now - 1000 * 60 * 90).toISOString(),
    },
    {
      id: 'd5',
      conversationId: 'demo_conv_2',
      senderId: 'me',
      sender: { id: 'me', name: 'You' },
      type: 'text',
      content: 'Both. Equal amounts of building and chaos.',
      xpAwarded: 3,
      createdAt: new Date(now - 1000 * 60 * 80).toISOString(),
    },
    {
      id: 'd6',
      conversationId: 'demo_conv_2',
      senderId: 'demo_2',
      sender: { id: 'demo_2', name: 'Rohan' },
      type: 'text',
      content: 'That tech meetup looked insane 🔥',
      xpAwarded: 2,
      createdAt: new Date(now - 1000 * 60 * 45).toISOString(),
    },
  ],
};
