import { UserTypes } from "./types";

// initial state
export const initialState = {
  currentUser: null,
};

// reducer
const userReducer = (state = initialState, action) => {
  console.log("Action: ", action);
  switch (action.type) {
    case UserTypes.SET_CURRENT_USER:
      console.log("Action payload: ", action.payload);
      return {
        ...state,
        currentUser: action.payload,
        //uid: action.payload.user?.uid,
      };

    default:
      return state;
  }
};

export default userReducer;
