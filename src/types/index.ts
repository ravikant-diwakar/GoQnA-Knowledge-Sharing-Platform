export interface User {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  createdAt: Date;
  role: 'user' | 'admin' | 'moderator';
  notifications: Notification[];
  emailVerified: boolean;
}

export interface Notification {
  id: string;
  type: 'mention' | 'like' | 'comment' | 'reply';
  fromUserId: string;
  fromUsername: string;
  content: string;
  itemId: string;
  itemType: 'question' | 'answer' | 'comment';
  read: boolean;
  createdAt: Date;
}

export interface Question {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  username: string;
  userPhotoURL?: string;
  views: number;
  answerCount: number;
  upvotes: number;
  downvotes: number;
  isSolved: boolean;
  comments: Comment[];
}

export interface Answer {
  id: string;
  questionId: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  username: string;
  userPhotoURL?: string;
  upvotes: number;
  downvotes: number;
  isAccepted: boolean;
  comments: Comment[];
}

export interface Comment {
  id: string;
  parentId: string;
  parentType: 'question' | 'answer';
  body: string;
  createdAt: Date;
  userId: string;
  username: string;
  userPhotoURL?: string;
  replies: Reply[];
  likes: string[]; // Array of userIds who liked
}

export interface Reply {
  id: string;
  commentId: string;
  body: string;
  createdAt: Date;
  userId: string;
  username: string;
  userPhotoURL?: string;
  likes: string[]; // Array of userIds who liked
}

export interface Tag {
  id: string;
  name: string;
  description: string;
  count: number;
}

export interface Vote {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'question' | 'answer' | 'comment' | 'reply';
  voteType: 'upvote' | 'downvote';
  createdAt: Date;
}