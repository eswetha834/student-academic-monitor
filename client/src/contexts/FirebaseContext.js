import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  db,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from '../firebase';

const FirebaseContext = createContext();

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const FirebaseProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Authentication functions
  const login = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const signup = async (email, password, userData) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: email,
        ...userData,
        createdAt: serverTimestamp(),
        role: userData.role || 'student'
      });
      
      return result.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Firestore functions
  const getUserData = async (userId) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const updateUserData = async (userId, data) => {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const addDocument = async (collectionName, data) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        userId: currentUser.uid
      });
      return docRef.id;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const getDocuments = async (collectionName, conditions = []) => {
    try {
      let q = collection(db, collectionName);
      
      if (conditions.length > 0) {
        q = query(q, ...conditions);
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const getDocument = async (collectionName, docId) => {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    signup,
    logout,
    getUserData,
    updateUserData,
    addDocument,
    getDocuments,
    getDocument
  };

  return (
    <FirebaseContext.Provider value={value}>
      {!loading && children}
    </FirebaseContext.Provider>
  );
};
