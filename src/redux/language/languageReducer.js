import { LanguageTypes } from "./types";

// initial state
export const initialState = {
  transcriptionText: null,
};

const languageReducer = (state = initialState, action) => {
  switch (action.type) {
    case LanguageTypes.PRINT_TRANSCRIPTION:
      return {
        ...state,
        transcriptionText: action.payload,
      };

    default:
      return state;
  }
};

export default languageReducer;
