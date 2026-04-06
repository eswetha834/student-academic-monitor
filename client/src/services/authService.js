// Step 5: Login in React - Authentication Service
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import app from "../firebase";

const auth = getAuth(app);

// Login user and get token
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const token = await userCredential.user.getIdToken();
    console.log("Firebase Token:", token); // IMPORTANT - This is the token to send to backend
    
    // Return both user info and token
    return {
      user: userCredential.user,
      token: token
    };
  } catch (err) {
    console.log("Login Error:", err.message);
    throw err;
  }
};

// Register new user
export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const token = await userCredential.user.getIdToken();
    
    return {
      user: userCredential.user,
      token: token,
      userData: userData
    };
  } catch (err) {
    console.log("Registration Error:", err.message);
    throw err;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("User logged out successfully");
  } catch (err) {
    console.log("Logout Error:", err.message);
    throw err;
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Get token for current user
export const getCurrentUserToken = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      return token;
    }
    return null;
  } catch (err) {
    console.log("Token Error:", err.message);
    return null;
  }
};

export default auth;
