import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Type-safe date formatting
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Type-safe grade calculation
export function calculateGradePoint(grade: string): number {
  const gradeMap: Record<string, number> = {
    'A+': 4.0,
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D+': 1.3,
    'D': 1.0,
    'F': 0.0,
  };
  return gradeMap[grade] || 0;
}

// Type-safe risk level color
export function getRiskLevelColor(level: string | null): string {
  const colorMap: Record<string, string> = {
    'low': 'text-green-400',
    'medium': 'text-yellow-400',
    'high': 'text-red-400',
    'critical': 'text-red-600',
  };
  return colorMap[level?.toLowerCase() || 'low'] || 'text-gray-400';
}