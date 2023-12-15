import * as actionTypes from "../actions/actionTypes";

const INITIAL_STATE = {
  email: null,
  id: null,
  error: null,
};

const reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case actionTypes.SIGN_IN:
      return { ...state, id: action.payload.id, error: null };
    case actionTypes.SIGN_OUT:
      return { ...state, email: null, id: null };
    case actionTypes.SIGN_UP:
      return { ...state, email: action.payload };
    case actionTypes.GET_USER:
      return {
        ...state,
        id: action.payload.id,
        email: action.payload.email,
      };
    default:
      return state;
  }
};

export default reducer;
