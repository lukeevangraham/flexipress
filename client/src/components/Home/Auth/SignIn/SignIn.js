import React, { useState } from "react";
import server from "../../../../apis/server";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../contexts/AuthContext";
import Button from "../../../UI/Button/Button";
import Input from "../../../UI/Input/Input";

import classes from "./SignIn.module.scss";

const SignIn = () => {
  const navigate = useNavigate();

  const { setIsLoggedIn, setAuthUser } = useAuth();

  let [signInForm, setSignInForm] = useState({
    email: {
      elementType: "input",
      elementConfig: {
        type: "email",
        placeholder: "Email Address",
      },
      value: "",
      validation: {
        required: true,
      },
      valid: false,
      touched: false,
    },
    password: {
      elementType: "input",
      elementConfig: {
        type: "password",
        placeholder: "Password",
      },
      value: "",
      validation: {
        required: true,
      },
      valid: false,
      touched: false,
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await server.post("/login", {
      email: signInForm.email.value,
      password: signInForm.password.value,
    });

    if (response.data) {
      server.get("/user_data").then((res) => {
        // console.log("getting user data", res);
        setIsLoggedIn(true);
        setAuthUser(res.data);
        navigate(response.data);
      });
    }
  };

  const inputChangedHandler = (e, inputIdentifier) => {
    const updatedSignInForm = {
      ...signInForm,
    };
    const updatedFormElement = {
      ...updatedSignInForm[inputIdentifier],
    };
    updatedFormElement.value = e.target.value;
    updatedFormElement.touched = true;
    updatedSignInForm[inputIdentifier] = updatedFormElement;
    setSignInForm(updatedSignInForm);
  };

  const formElementsArray = [];
  for (let key in signInForm) {
    formElementsArray.push({
      id: key,
      config: signInForm[key],
    });
  }
  let form = (
    <form onSubmit={handleSubmit} className={classes.form}>
      {formElementsArray.map((formElement) => (
        <Input
          key={formElement.id}
          elementType={formElement.config.elementType}
          elementConfig={formElement.config.elementConfig}
          value={formElement.config.value}
          changed={(e) => inputChangedHandler(e, formElement.id)}
          required={formElement.config.validation.required}
        />
      ))}
      <div className={classes.form__group}>
        <Button type="submit">
          <>Sign In</>
        </Button>
      </div>
    </form>
  );

  return <div className={classes.signIn}>{form}</div>;
};

export default SignIn;
