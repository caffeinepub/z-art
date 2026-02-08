import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProfileSetupContextType {
  isOpen: boolean;
  openProfileSetup: () => void;
  closeProfileSetup: () => void;
}

const ProfileSetupContext = createContext<ProfileSetupContextType | undefined>(undefined);

export function ProfileSetupProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openProfileSetup = () => setIsOpen(true);
  const closeProfileSetup = () => setIsOpen(false);

  return (
    <ProfileSetupContext.Provider value={{ isOpen, openProfileSetup, closeProfileSetup }}>
      {children}
    </ProfileSetupContext.Provider>
  );
}

export function useProfileSetup() {
  const context = useContext(ProfileSetupContext);
  if (context === undefined) {
    throw new Error('useProfileSetup must be used within a ProfileSetupProvider');
  }
  return context;
}
