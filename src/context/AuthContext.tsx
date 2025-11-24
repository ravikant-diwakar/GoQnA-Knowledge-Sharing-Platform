import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { User, Notification } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  updateUserEmail: (newEmail: string, password: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isAdmin: boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data() as User;
          setUserData(data);
          setIsAdmin(data.role === 'admin');
        }
      } else {
        setUserData(null);
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, username: string, displayName: string) => {
    const usernameQuery = await getDoc(doc(db, 'usernames', username.toLowerCase()));
    if (usernameQuery.exists()) {
      throw new Error('Username is already taken');
    }

    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(user);
    await updateProfile(user, { displayName: username });

    const userData: User = {
      uid: user.uid,
      email: user.email!,
      username: username.toLowerCase(),
      displayName,
      createdAt: new Date(),
      role: 'user',
      bio: '',
      photoURL: '',
      notifications: [],
      emailVerified: false
    };

    await setDoc(doc(db, 'users', user.uid), userData);
    await setDoc(doc(db, 'usernames', username.toLowerCase()), { uid: user.uid });

    setUserData(userData);
    await signOut(auth);
  };

  const login = async (email: string, password: string) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      if (!user.emailVerified) {
        await signOut(auth);
        throw new Error('Please verify your email before logging in');
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { emailVerified: true });
      } catch (updateError) {
        console.error("Error updating user verification status:", updateError);
        // Continue login even if update fails
      }

      return user;

    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password');
      }
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserData(null);
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!currentUser) throw new Error('No authenticated user');

    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, data);

    if (data.displayName) {
      await updateProfile(currentUser, { displayName: data.displayName });
    }
    if (data.photoURL) {
      await updateProfile(currentUser, { photoURL: data.photoURL });
    }

    // Update local state
    setUserData(prev => prev ? { ...prev, ...data } : null);
  };

  const updateUserEmail = async (newEmail: string, password: string) => {
    if (!currentUser) throw new Error('No authenticated user');

    const credential = EmailAuthProvider.credential(currentUser.email!, password);
    await reauthenticateWithCredential(currentUser, credential);
    await updateEmail(currentUser, newEmail);

    await updateDoc(doc(db, 'users', currentUser.uid), { email: newEmail });
    setUserData(prev => prev ? { ...prev, email: newEmail } : null);
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser) throw new Error('No authenticated user');

    const credential = EmailAuthProvider.credential(currentUser.email!, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPassword);
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    if (!currentUser) throw new Error('No authenticated user');

    const userRef = doc(db, 'users', notification.fromUserId);
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date(),
      read: false
    };

    await updateDoc(userRef, {
      notifications: arrayUnion(newNotification)
    });

    // Update local state
    setUserData(prev => prev ? {
      ...prev,
      notifications: [...prev.notifications, newNotification]
    } : null);
  };

  const markNotificationAsRead = async (notificationId: string) => {
    if (!currentUser || !userData) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const updatedNotifications = userData.notifications.map(notification =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    );

    await updateDoc(userRef, { notifications: updatedNotifications });
    setUserData(prev => prev ? { ...prev, notifications: updatedNotifications } : null);
  };

  const clearNotifications = async () => {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, { notifications: [] });
    setUserData(prev => prev ? { ...prev, notifications: [] } : null);
  };

  const value = {
    currentUser,
    userData,
    loading,
    signUp,
    login,
    logout,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
    isAdmin,
    addNotification,
    markNotificationAsRead,
    clearNotifications
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};