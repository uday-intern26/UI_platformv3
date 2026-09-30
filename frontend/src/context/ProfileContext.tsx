import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface UserProfile {
  fullName: string;
  role: string;
  email: string;
  phone: string;
  title: string;
  department: string;
}

const STORAGE_KEY = 'aijewel.userProfile.v2';

const DEFAULT_PROFILE: UserProfile = {
  fullName: 'Priya Sharma',
  role: 'System Administrator',
  email: 'priya.sharma@aijewel.com',
  phone: '+91 98765 43210',
  title: 'System Administrator',
  department: 'Platform Operations',
};

interface ProfileContextValue {
  profile: UserProfile;
  updateProfile: (patch: Partial<UserProfile>) => void;
  saveProfile: (next: UserProfile) => void;
  initials: string;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U';
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      updateProfile: (patch) => setProfile((prev) => ({ ...prev, ...patch })),
      saveProfile: (next) => setProfile(next),
      initials: getInitials(profile.fullName),
    }),
    [profile],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return ctx;
}
