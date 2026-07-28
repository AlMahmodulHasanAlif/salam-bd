// src/context/AuthProvider.jsx
import React, { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase/firebase.init";
import { syncUser } from "../api/userApi"; // ✅ removed getUserRole import

const provider = new GoogleAuthProvider();

export const getGuestId = () => {
  let guestId = localStorage.getItem("guestId");
  if (!guestId) {
    guestId = `guest_${Date.now()}`;
    localStorage.setItem("guestId", guestId);
  }
  return guestId;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // NOTE: these must NOT flip the global `loading` flag. The route guards
  // (PublicRoute/ProtectedRoute) render a full-screen spinner while global
  // `loading` is true. onAuthStateChanged is the single source of truth for it
  // and only fires on SUCCESS — so setting it true here would leave it stuck on
  // a failed login (wrong password), replacing the form with an endless spinner
  // and swallowing the error toast. In-flight state is handled by each page's
  // own local `loading` (the "Signing in…"/"Creating account…" button).
  const registerUser = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const signInUser = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const signInGoogle = () => signInWithPopup(auth, provider);

  const updateUserProfile = (profile) =>
    updateProfile(auth.currentUser, profile);

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  // Change the signed-in user's password. Firebase requires a *recent* login
  // before it will accept a password change, so we re-authenticate with the
  // current password first (this also verifies the user actually knows it).
  // Only works for email/password accounts — Google-only users have no password
  // credential to re-authenticate with.
  const changePassword = async (currentPassword, newPassword) => {
    const current = auth.currentUser;
    if (!current?.email) throw new Error("You are not signed in.");

    const credential = EmailAuthProvider.credential(
      current.email,
      currentPassword,
    );
    await reauthenticateWithCredential(current, credential);
    await updatePassword(current, newPassword);
  };

  const logOut = () => {
    setLoading(true);
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        try {
          await syncUser({
            email: currentUser.email,
            name: currentUser.displayName || "",
            photoURL: currentUser.photoURL || "",
          });
        } catch (err) {
          console.error("User sync failed:", err);
        }
        setUser(currentUser); // ✅ keep original Firebase user, no spreading
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const authInfo = {
    user,
    loading,
    registerUser,
    signInUser,
    signInGoogle,
    updateUserProfile,
    resetPassword,
    changePassword,
    logOut,
    setLoading,
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;