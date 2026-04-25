import { ReactNode } from 'react';

export type Category = string;

export type Assignment = 'Baby A' | 'Baby B' | 'Both';

export interface InventoryItem {
  id: string;
  name: string;
  category: Category;
  currentCount: number;
  minThreshold: number;
  assignment: Assignment;
  unit: string;
  updatedAt: number;
  imageUrl?: string;
}

export type FeedType = 'Breast Milk' | 'Formula';

export interface FeedingLog {
  id: string;
  baby: 'Baby A' | 'Baby B';
  timestamp: number;
  nextFeedAt: number;
  type: FeedType;
}

export interface CategoryInfo {
  name: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
  borderColor: string;
  shadowColor: string;
}

export interface SharedData {
  items: InventoryItem[];
  categories: CategoryInfo[];
  feedingLogs: FeedingLog[];
}
