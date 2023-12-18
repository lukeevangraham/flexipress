import * as actionTypes from "./actionTypes";
import server from "../../apis/server";

export const getUser = () => async (dispatch) => {
  console.log("getting user!");
  const response = await server.get("user_data");
  dispatch({ type: actionTypes.GET_USER, payload: response.data });
};

export const signIn = (formValues) => async (dispatch) => {
  console.log("Signing in!");
  try {
    const response = await server.post("/login", { ...formValues });
    dispatch({ type: actionTypes.SIGN_IN, payload: response.data });
  } catch (error) {
    console.log("Error: ", error.message);
    error.message === "Request failed with status code 401"
      ? dispatch({
          type: actionTypes.AUTH_FAIL,
          error: { ...error, message: "Invalid email address or password" },
        })
      : dispatch({ type: actionTypes.AUTH_FAIL, error: error });
  }
};
