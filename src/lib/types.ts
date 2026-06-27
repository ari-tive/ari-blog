import { Timestamp } from "firebase/firestore";

export interface PostImage {
  url: string;
  isThumbnail: boolean;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  body: string;
  footer?: string;
  images: PostImage[];
  createdAt: Timestamp;
  likeCount: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  createdAt: Timestamp;
}

export interface Like {
  id: string;
  userId: string;
  createdAt: Timestamp;
}
