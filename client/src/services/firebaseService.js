import { 
  db, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from '../firebase';

// Academic Services for Firebase
export const firebaseAcademicService = {
  // User Management
  async createUserProfile(userId, userData) {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  },

  async getUserProfile(userId) {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  async updateUserProfile(userId, data) {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Marks Management
  async addMarks(marksData) {
    try {
      const docRef = await addDoc(collection(db, 'marks'), {
        ...marksData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding marks:', error);
      throw error;
    }
  },

  async getStudentMarks(studentId) {
    try {
      const q = query(
        collection(db, 'marks'),
        where('studentId', '==', studentId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting student marks:', error);
      throw error;
    }
  },

  async updateMarks(marksId, marksData) {
    try {
      const docRef = doc(db, 'marks', marksId);
      await updateDoc(docRef, {
        ...marksData,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating marks:', error);
      throw error;
    }
  },

  // Attendance Management
  async addAttendance(attendanceData) {
    try {
      const docRef = await addDoc(collection(db, 'attendance'), {
        ...attendanceData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding attendance:', error);
      throw error;
    }
  },

  async getStudentAttendance(studentId) {
    try {
      const q = query(
        collection(db, 'attendance'),
        where('studentId', '==', studentId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting student attendance:', error);
      throw error;
    }
  },

  // Goals Management
  async addGoal(goalData) {
    try {
      const docRef = await addDoc(collection(db, 'goals'), {
        ...goalData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  },

  async getStudentGoals(studentId) {
    try {
      const q = query(
        collection(db, 'goals'),
        where('studentId', '==', studentId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting student goals:', error);
      throw error;
    }
  },

  async updateGoal(goalId, goalData) {
    try {
      const docRef = doc(db, 'goals', goalId);
      await updateDoc(docRef, {
        ...goalData,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  },

  async deleteGoal(goalId) {
    try {
      await deleteDoc(doc(db, 'goals', goalId));
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },

  // Study Sessions
  async addStudySession(sessionData) {
    try {
      const docRef = await addDoc(collection(db, 'studySessions'), {
        ...sessionData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding study session:', error);
      throw error;
    }
  },

  async getStudentStudySessions(studentId) {
    try {
      const q = query(
        collection(db, 'studySessions'),
        where('studentId', '==', studentId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting study sessions:', error);
      throw error;
    }
  },

  // Notifications
  async addNotification(notificationData) {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding notification:', error);
      throw error;
    }
  },

  async getUserNotifications(userId) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  },

  // Performance Analytics
  async getPerformanceStats(studentId) {
    try {
      // Get marks data
      const marksQuery = query(
        collection(db, 'marks'),
        where('studentId', '==', studentId)
      );
      const marksSnapshot = await getDocs(marksQuery);
      const marks = marksSnapshot.docs.map(doc => doc.data());

      // Calculate stats
      const totalMarks = marks.reduce((sum, mark) => sum + (Number(mark.marks) || 0), 0);
      const avgMarks = marks.length > 0 ? totalMarks / marks.length : 0;
      const gpa = (avgMarks / 25).toFixed(2);

      return {
        currentGpa: parseFloat(gpa),
        totalSubjects: marks.length,
        avgMarks: avgMarks.toFixed(1),
        totalCredits: marks.length * 3
      };
    } catch (error) {
      console.error('Error calculating performance stats:', error);
      throw error;
    }
  }
};
