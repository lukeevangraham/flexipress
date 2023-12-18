import axios from "axios";
import { useState } from "react";
import Input from "../../../UI/Input/Input";
import Button from "../../../UI/Button/Button";
import { signIn } from "../../../../store/actions/";

import classes from "./SignUp.module.scss";

const SignUp = () => {
  const [signUpForm, setSignUpForm] = useState({
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
    },
    passwordConfirm: {
      elementType: "input",
      elementConfig: {
        type: "password",
        placeholder: "Confirm password",
      },
      value: "",
      validation: {
        required: true,
      },
    },
  });

  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (signUpForm.password.value === signUpForm.passwordConfirm.value) {
      // const requestOptions = {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     email: signUpForm.email.value,
      //     password: signUpForm.password.value,
      //   }),
      // };
      const signupFormValues = {
        email: signUpForm.email.value,
        password: signUpForm.password.value,
      };
      axios
        .post("http://localhost:3000/api/signup", signupFormValues)
        // console.log("BODY: ", requestOptions.body);
        // fetch("http://localhost:3000/api/signup", requestOptions)
        .then((response) => {
          console.log("RES: ", response);
          return response.json();
        })
        .then((data) => {
          console.log("DATA: ", data);
          data.errors
            ? setError(data.errors[0].message)
            : signIn({
                email: data.email,
                password: signUpForm.password.value,
              });
        });
    } else {
      setError("Passwords must match");
    }
  };

  const inputChangedHandler = (e, inputIdentifier) => {
    const updatedSignUpForm = {
      ...signUpForm,
    };
    const updatedFormElement = {
      ...updatedSignUpForm[inputIdentifier],
    };
    updatedFormElement.value = e.target.value;
    updatedFormElement.touched = true;
    updatedSignUpForm[inputIdentifier] = updatedFormElement;
    setSignUpForm(updatedSignUpForm);
  };

  const formElementsArray = [];
  for (let key in signUpForm) {
    formElementsArray.push({
      id: key,
      config: signUpForm[key],
    });
  }

  const form = (
    <form onSubmit={handleSubmit}>
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
      {error ? <div className={classes.error}>{error}</div> : null}
      <Button type="submit" color={"green"}>
        <>Sign Up</>
      </Button>
    </form>
  );

  return <div className={classes.SignUp}>{form}</div>;
};

export default SignUp;
