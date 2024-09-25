import { useState } from "react";
// import { AuthContext } from "../../../store/auth-context";
import SignIn from "./SignIn/SignIn";
import SignUp from "./SignUp/SignUp";
import Button from "../../UI/Button/Button";

import classes from "./Auth.module.scss";

const Auth = () => {
  // const UserCtx = useContext(AuthContext)
  let [signupChosen, setSignupChosen] = useState(false);

  return (
    <div className={classes.Auth}>
      {signupChosen ? <SignUp /> : <SignIn />}
      <div className={classes.signUpWrapper}>
        {signupChosen ? (
          <Button color="secondary" clicked={() => setSignupChosen(false)}>
            Already have an account?
          </Button>
        ) : (
          <Button color="secondary" clicked={() => setSignupChosen(true)}>
            Create An Account
          </Button>
        )}
      </div>
    </div>
  );
};

export default Auth;
