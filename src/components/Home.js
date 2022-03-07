import React, { useEffect, useCallback } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import "./Home.css";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);

  const checkAuth = useCallback(
    async (user) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
        } else {
          // User is signed out
          navigate("/");
        }
      });
    },
    [navigate]
  );

  useEffect(() => {
    checkAuth(currentUser);
  }, [checkAuth, currentUser]);

  return (
    <div>
      <h1>Welcome home</h1>
      <p>
        <button
          className="logout"
          onClick={() => {
            signOut(auth);
            //dispatch(setSound(null));
            dispatch({ type: "SIGNED_OUT" });
          }}
        >
          Sign out
        </button>
        <br />
        <button onClick={() => navigate("/audioplayer")}>AudioPlayer</button>
        <br />
        <button onClick={() => navigate("/AudioRecording")}>
          AudioRecording
        </button>
        <button onClick={() => navigate("/library")}>Library</button>
      </p>
    </div>
  );
};

export default Home;
