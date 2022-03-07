import { useReactMediaRecorder } from "react-media-recorder";
import * as React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateRecordingList,
  setRecordURI,
} from "../../../redux/recording/actions";
import moment from "moment";
import getBlobDuration from "get-blob-duration";
import db, { storage } from "../../../firebase";
import { uploadBytes, ref } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { auth } from "../../../firebase";
import { setCurrentUser } from "../../../redux/user/actions";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

const AudioRecording = () => {
  const navigate = useNavigate();
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ audio: true }); // could also put video and screen props as true!

  const [filename, setFilename] = React.useState("");
  const [transcript, setTranscript] = React.useState("");
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const dispatch = useDispatch();
  const recordingList = useSelector(
    (state) => state.recordingReducer.recordingList
  );
  //const recording = useSelector((state) => state.recordingReducer.recording);
  const isRecording = useSelector(
    (state) => state.recordingReducer.isRecording
  );
  const recordURI = useSelector((state) => state.recordingReducer.recordURI);
  const currentUser = useSelector((state) => state.user.currentUser);
  console.log("Internal Recording CurrentUser: ", currentUser);
  console.log("Internal Recording isRecording: ", isRecording);
  console.log("Firebase storage object: ", storage._bucket);

  let recorder;

  // this is to check for the userID upon page refresh in the event it gets wiped out.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      console.log(authUser); // uid
      if (authUser) {
        dispatch(setCurrentUser(authUser));
        //navigate("/home");
      }
    });

    return unsubscribe;
  }, [dispatch]);

  const uploadAudio = async (audioData) => {
    //const uriParts = recordURI.split(".");
    let uriParts = mediaBlobUrl.split(".").toString().replace("//", "");
    //uriParts = uriParts.toString().replace("//", "");
    //const uriParts = mediaBlobUrl.split(".").replace(/\//g, "");
    const fileType = uriParts[uriParts.length - 1];
    const fileName =
      //audioData.filename + "_" + currentUser + `${Date.now()}.${fileType}`;
      audioData.filename + "_" + currentUser.uid + `${Date.now()}.${fileType}`;
    audioData.originalFilename = fileName;
    console.log("FILE NAME", fileName);
    audioData.fileName = fileName;

    //delete filename
    delete audioData.filename;

    try {
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          try {
            resolve(xhr.response);
          } catch (error) {
            console.log("error:", error);
          }
        };
        xhr.onerror = (e) => {
          console.log(e);
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", mediaBlobUrl, true);
        xhr.send(null);
      });
      if (blob != null) {
        const storageRef = ref(storage, fileName);
        uploadBytes(storageRef, blob).then((snapshot) => {
          addDoc(
            //collection(db, `customers/${userContext.user.uid}/checkout_sessions`),
            //collection(db, `customers/${user.uid}/checkout_sessions`),
            collection(db, `recordings/${currentUser.uid}/files`),
            audioData
          );
          console.log("snapshot is: ", snapshot);
        });
      } else {
        console.log("erroor with blob");
      }
    } catch (error) {
      console.log("error:", error);
    }
  };

  const startRecordingAudio = async () => {
    startRecording();
    // call transcription function later
    setIsTranscribing(true);
    const response = await fetch("http://localhost:5001/");
    const data = await response.json();
    console.log("DATOKEN", data);
    if (data.error) {
      alert(data.error);
    }

    const { token } = data;

    if (!window.socket) {
      // establish wss with AssemblyAI (AAI) at 16000 sample rate
      window.socket = await new WebSocket(
        `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`
      );
    }

    // handle incoming messages to display transcription to the DOM
    const texts = {};
    window.socket.onmessage = (message) => {
      console.log("Entering onmessage");
      console.log("onwindow.socket message is: ", message);
      let msg = "";
      const res = JSON.parse(message.data);
      texts[res.audio_start] = res.text;
      const keys = Object.keys(texts);
      keys.sort((a, b) => a - b);
      for (const key of keys) {
        if (texts[key]) {
          msg += ` ${texts[key]}`;
        }
      }
      console.log("Leaving onmessage. msg is: ", msg);
      setTranscript(msg);
      console.log("Opening. window.socket is: ", window.socket);
    };

    window.socket.onerror = (event) => {
      console.error(event);
      window.socket.close();
      setIsTranscribing(false);
    };

    window.socket.onclose = (event) => {
      console.log(event);
      //window.socket = null;
      setIsTranscribing(false);
    };

    window.socket.onopen = (e) => {
      // solution to reopen websocket instance:
      // https://stackoverflow.com/questions/47180904/websocket-even-after-firing-onopen-event-still-in-connecting-state
      if (e.target.readyState !== WebSocket.OPEN) return;
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          recorder = new RecordRTC(stream, {
            type: "audio",
            mimeType: "audio/webm;codecs=pcm", // endpoint requires 16bit PCM audio
            recorderType: StereoAudioRecorder,
            timeSlice: 250, // set 250 ms intervals of data that sends to AAI
            desiredSampRate: 16000,
            numberOfAudioChannels: 1, // real-time requires only one channel
            bufferSize: 4096,
            audioBitsPerSecond: 128000,
            ondataavailable: (blob) => {
              const reader = new FileReader();
              reader.onload = () => {
                const base64data = reader.result;

                // audio data must be sent as a base64 encoded string
                //if (window.socket) {
                //window.socket.send(

                e.target.send(
                  JSON.stringify({
                    audio_data: base64data.split("base64,")[1],
                  })
                );
                //}
              };
              reader.readAsDataURL(blob);
            },
          });

          recorder.startRecording();
        })
        .catch((err) => console.error(err));
    };
  };

  async function stopRecordingAudio() {
    stopRecording();
    setIsTranscribing(false);
  }

  async function renameRecord() {
    if (!filename && filename.length < 1) {
      alert("Filename can not be empty!");
      return;
    }
    setRecordURI(mediaBlobUrl);

    const durationSeconds = await getBlobDuration(mediaBlobUrl); // or it could just be mediaBlobUrl
    const durationMillis = durationSeconds * 1000;
    console.log("durationSeconds is: ", durationSeconds);
    const momentduration = moment.duration(durationMillis);
    let duration = moment
      .utc(momentduration.as("milliseconds"))
      .format("HH:mm:ss");
    if (momentduration.hours() === 0) {
      duration = moment.utc(momentduration.as("milliseconds")).format("mm:ss");
    }
    const recordingdate = moment().format("MMMM Do YYYY");
    const newRecordingList = [...recordingList];
    newRecordingList.push({
      filepath: mediaBlobUrl,
      filename,
      recordingdate: recordingdate,
      duration: duration,
      //duration: durationSeconds,
      transcript: transcript,
    });

    //newRecordingList.reverse()   //sorting
    //props.setRecordinglistProp(newRecordingList);
    dispatch(updateRecordingList(newRecordingList));
    console.log("In Internal Recording, currentUser is: ", currentUser);
    const audioData = {
      //user: currentUser,
      user: currentUser.uid,
      filename,
      recordingdate: recordingdate,
      duration: duration,
      //duration: durationSeconds,
      transcript: transcript,
    };
    uploadAudio(audioData);

    // Reset the field
    setFilename("");
    dispatch(setRecordURI(null));
    alert("entered...");

    // We can go to library tab
    navigate("/home");
  }

  function renderView() {
    if (status === "recording" || status === "idle") {
      // while recording or not recording yet
      if (isTranscribing) {
        return (
          <div>
            <p>{status}</p>
            <button onClick={stopRecordingAudio}>Stop Recording</button>
            {/*<video src={mediaBlobUrl} controls autoPlay loop />*/}
            <video src={mediaBlobUrl} controls />
            <h1>Transcript below</h1>
            <p>{transcript}</p>
          </div>
        );
      } else {
        return (
          <div>
            <p>{status}</p>
            <button onClick={startRecordingAudio}>Start Recording</button>
            {/*<video src={mediaBlobUrl} controls autoPlay loop />*/}
            <video src={mediaBlobUrl} controls />
            <h1>Transcript below</h1>
            <p>{transcript}</p>
          </div>
        );
      }
    }
    if (status === "stopped") {
      // finished recording
      return (
        <div>
          {/*<TextInput
            placeholder="audio name"
            onChangeText={(text) => setFilename(text)}
            style={{ borderWidth: 1, padding: 8, height: 45, width: 180 }}
          />*/}
          <p>{mediaBlobUrl}</p>
          <p>recordURI is: {recordURI}</p>
          <input
            value={filename}
            name="filename"
            onChange={(e) => setFilename(e.target.value)}
          />
          <button onClick={renameRecord}>Rename</button>
        </div>
      );
    }
  }

  return (
    <div
      style={{
        flexDirection: "row",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {renderView()}
    </div>
  );
};

export default AudioRecording;
