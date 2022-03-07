import { RecordingAudioTypes } from "./types";

// initial state
export const initialState = {
  recordingList: [],
  sound: null,
  hasSoundPaused: false,
  hasSoundStopped: true,
  currentSoundPlaying: null,
  currentSoundRecording: null,
  currentPlayingStatus: null,
  recording: undefined,
  isRecording: false,
  recordURI: null,
};

// reducer
const recordingAudioReducer = (state = initialState, action) => {
  switch (action.type) {
    case RecordingAudioTypes.UPDATE_RECORDING_LIST:
      return {
        ...state,
        recordingList: action.payload,
      };

    case RecordingAudioTypes.SET_SOUND:
      return {
        ...state,
        sound: action.payload,
      };
    case RecordingAudioTypes.SET_SOUND_PAUSE:
      return {
        ...state,
        hasSoundPaused: action.payload,
      };

    case RecordingAudioTypes.SET_SOUND_STOPPED:
      return {
        ...state,
        hasSoundStopped: action.payload,
      };
    case RecordingAudioTypes.SET_CURRENT_SOUND_PLAYING:
      return {
        ...state,
        currentSoundPlaying: action.payload,
      };

    case RecordingAudioTypes.SET_CURRENT_SOUND_RECORDING:
      return {
        ...state,
        currentSoundRecording: action.payload,
      };
    case RecordingAudioTypes.SET_CURRENT_PLAYING_STATUS:
      return {
        ...state,
        currentPlayingStatus: action.payload,
      };
    case RecordingAudioTypes.SET_DURATION_MILLIS:
      return {
        ...state,
        durationMillis: action.payload,
      };
    case RecordingAudioTypes.SET_SLIDING_POSITION:
      return {
        ...state,
        slidingPosition: action.payload,
      };
    case RecordingAudioTypes.SET_RECORDING:
      return {
        ...state,
        recording: action.payload,
      };
    case RecordingAudioTypes.SET_IS_RECORDING:
      return {
        ...state,
        isRecording: action.payload,
      };
    case RecordingAudioTypes.SET_RECORD_URI:
      return {
        ...state,
        recordURI: action.payload,
      };
    case RecordingAudioTypes.SET_RECORDING_DURATION:
      return {
        ...state,
        recordingDuration: action.payload,
      };

    default:
      return state;
  }
};

export default recordingAudioReducer;
