import { useState } from "react";
import SignIn from "./SignIn/SignIn";
import SignUp from "./SignUp/SignUp";

const Auth = () => {
  let [signupChosen, setSignupChosen] = useState(true);

  return <>{signupChosen ? <SignUp /> : <SignIn />}</>;
};

export default Auth;
