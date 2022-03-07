import * as React from "react";
import { useEffect, useCallback } from "react";
import db, { storage, auth } from "../../../firebase";
import { useDispatch, useSelector } from "react-redux";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { setCurrentUser } from "../../../redux/user/actions";
import { setSound } from "../../../redux/recording/actions";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

const Library = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);
  const [cloudRecordingList, setCloudRecordingList] = React.useState([]);

  const downloadAudio = async (fileName) => {
    const uri = getDownloadURL(ref(storage, fileName));
    return uri;
  };

  const loadRecordings = useCallback(async (authUser) => {
    const recordingRef = collection(db, `recordings/${authUser.uid}/files`);
    const recordingRefQuery = query(
      recordingRef,
      where("user", "==", authUser.uid)
    );
    const querySnapshot = await getDocs(recordingRefQuery);
    if (querySnapshot) {
      const data = [];
      const audioDownloads = [];
      querySnapshot.forEach(async (documentSnapshot) => {
        if (documentSnapshot.exists()) {
          const originalFilename = documentSnapshot.data().originalFilename;
          data.push(documentSnapshot.data());
          audioDownloads.push(downloadAudio(originalFilename));
        }
      });

      Promise.all(audioDownloads).then((res) => {
        setCloudRecordingList(
          data.map((el, i) => {
            return { ...el, filepath: res[i] };
          })
        );
      });
    }
  }, []);

  // this is to check for the userID upon page refresh in the event it gets wiped out.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      console.log("authUser is: ", authUser); // uid
      if (authUser) {
        dispatch(setCurrentUser(authUser));
        loadRecordings(authUser);
      }
    });

    return unsubscribe;
  }, [dispatch, loadRecordings]);

  React.useEffect(() => {
    console.log("Cloud Recording List is: ", cloudRecordingList);
  }, [cloudRecordingList]);

  // function to delete a recording:
  async function deleteRecording(originalFilename, authUser) {
    console.log("deleting recording: ", originalFilename);
    const deleteRef = collection(db, `recordings/${authUser.uid}/files`);
    let deleteQuery = query(
      deleteRef,
      where("user", "==", authUser.uid),
      where("originalFilename", "==", originalFilename)
    );
    const querySnapshot = await getDocs(deleteQuery);
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
    navigate("/home");
  }

  // will call later
  async function viewContent(item) {
    //dispatch(printTranscription(transcription));
    //console.log("Transcription from Library is: ", transcription);
    dispatch(setSound(item));
    navigate("/audioplayer");
  }

  return (
    <div>
      <h2>List of recordings and transcriptions</h2>
      <ul>
        {cloudRecordingList.map(function (item) {
          console.log("item", item);
          return (
            <li key={item.originalFilename}>
              <div>{item.fileName}</div>
              <button onClick={() => viewContent(item)}>
                View Recording And Transcription
              </button>
              <button
                onClick={() =>
                  deleteRecording(item.originalFilename, currentUser)
                }
              >
                Delete
              </button>
            </li>
          );
        })}
      </ul>
      <h3>The number of recordings is: {cloudRecordingList.length}</h3>
    </div>
  );
};

export default Library;
