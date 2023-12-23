import { useState, useContext } from "react";
// import { AuthContext } from "../../../store/auth-context";
import SignIn from "./SignIn/SignIn";
import SignUp from "./SignUp/SignUp";

const Auth = () => {
  // const UserCtx = useContext(AuthContext)
  let [signupChosen, setSignupChosen] = useState(false);

  return <>{signupChosen ? <SignUp /> : <SignIn />}</>;
};

export default Auth;
