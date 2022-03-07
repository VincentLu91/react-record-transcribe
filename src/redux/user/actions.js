import { UserTypes } from "./types";

// USER ACTIONS
export const setCurrentUser = (currentUser) => ({
  type: UserTypes.SET_CURRENT_USER,
  payload: currentUser,
});
