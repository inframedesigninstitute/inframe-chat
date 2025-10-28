import React, { createContext, ReactNode, useContext, useState } from 'react';

export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  fatherName?: string;
  batch?: string;
  courseName?: string;
  department?: string;
  isApproved: boolean;
  profilePicture?: string;
  bio?: string;
  phoneNumber?: string;
  joinedDate: Date;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isStudent: boolean;
  isFaculty: boolean;
  isAdmin: boolean;
  canCreateGroups: boolean;
  canMessageStudents: boolean;
  canCallStudents: boolean;
  canMessageAnyUser: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const isStudent = user?.role === 'student';
  const isFaculty = user?.role === 'faculty';
  const isAdmin = user?.role === 'admin';

  // Role-based permissions
  const canCreateGroups = isFaculty || isAdmin;
  const canMessageStudents = isFaculty || isAdmin;
  const canCallStudents = isFaculty || isAdmin;
  const canMessageAnyUser = isFaculty || isAdmin;

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isStudent,
        isFaculty,
        isAdmin,
        canCreateGroups,
        canMessageStudents,
        canCallStudents,
        canMessageAnyUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
export default UserProvider;
