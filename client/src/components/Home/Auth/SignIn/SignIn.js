import axios from "axios";
import React, { useState } from "react";
import Button from "../../../UI/Button/Button";
import Input from "../../../UI/Input/Input";

import classes from "./SignIn.module.scss";

const SignIn = ({ signIn, signOut }) => {
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

    // // REDUX WAY
    // signIn({
    //   email: signInForm.email.value,
    //   password: signInForm.password.value,
    // });

    const response = await axios.post("http://localhost:3000/api/login", {
      email: signInForm.email.value,
      password: signInForm.password.value,
    });

    console.log("HERE: ", response)
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
        <Button type="submit" color={"green"}>
          <>Sign In</>
        </Button>
      </div>
    </form>
  );

  return <div className={classes.signIn}>{form}</div>;
};

export default SignIn;
