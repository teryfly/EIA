import { UserRole } from '@prisma/client';

export interface UserSeedData {
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
}

export const usersData: UserSeedData[] = [
  {
    username: 'admin',
    email: 'admin@rup-system.local',
    fullName: 'System Administrator',
    role: 'admin',
    department: 'IT Operations',
    isActive: true,
  },
  {
    username: 'pm001',
    email: 'alice.pm@rup-system.local',
    fullName: 'Alice Johnson',
    role: 'project_manager',
    department: 'Project Management Office',
    isActive: true,
  },
  {
    username: 'dev001',
    email: 'bob.dev@rup-system.local',
    fullName: 'Bob Smith',
    role: 'developer',
    department: 'Engineering',
    isActive: true,
  },
  {
    username: 'reviewer',
    email: 'charlie.qa@rup-system.local',
    fullName: 'Charlie Davis',
    role: 'reviewer',
    department: 'Quality Assurance',
    isActive: true,
  },
];