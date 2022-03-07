import { useEffect, useState } from "react";
import "./App.css";
import Home from "./components/Home";
import Signin from "./components/Signin";
import { auth } from "./firebase";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import store, { persistor } from "./redux/"; //src/redux/index.js
import { PersistGate } from "redux-persist/integration/react";
import AudioPlayer from "./components/pages/AudioPlayer/AudioPlayer";
import AudioRecording from "./components/pages/AudioRecording/AudioRecording";
import Library from "./components/pages/Library/Library";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userAuth) => {
      const user = {
        uid: userAuth?.uid,
        email: userAuth?.email,
      };
      if (userAuth) {
        console.log(userAuth);
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <div className="App">
          <Router>
            <Routes>
              <Route path="/" element={<Signin />} />
              <Route path="/home" element={<Home />} />
              <Route path="/audioplayer" element={<AudioPlayer />} />
              <Route path="/AudioRecording" element={<AudioRecording />} />
              <Route path="/library" element={<Library />} />
              <Route path="**" element={<Home />} />
            </Routes>
            {/*</UserProvider>*/}
          </Router>
        </div>
      </PersistGate>
    </Provider>
  );
}

export default App;
