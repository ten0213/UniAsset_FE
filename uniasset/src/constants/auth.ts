import type { User } from '../types/auth';

export const isAdminUser = (user: User | null): boolean => user?.role === 'ADMIN';
