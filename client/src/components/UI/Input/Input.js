import React from "react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import classes from "./Input.module.scss";

const Input = ({ elementType, elementConfig, value, changed, required }) => {
  let inputElement = null;
  const inputClasses = [classes.input];

  switch (elementType) {
    case "input":
      inputElement = (
        <input
          className={inputClasses.join(" ")}
          {...elementConfig}
          value={value}
          onChange={changed}
          name={elementConfig.placeholder}
          required={required ? true : null}
        />
      );
      break;
    case "date":
      inputElement = (
        <div style={{ position: "relative" }}>
          <DatePicker
            {...elementConfig}
            //   selected={startDate}
            selected={value}
            onChange={changed}
            required={required ? true : null}
            //   onChange={(date) => setStartDate(date)}
            //   timeInputLabel="Time:"
            //   dateFormat="MM/dd/yyyy h:mm aa"
            //   showTimeInput
          />
        </div>
      );
      break;
    default:
      break;
  }

  return (
    <div className={classes.inputGroup}>
      {inputElement}
      <label htmlFor={elementConfig.placeholder} className={classes.label}>
        {elementConfig.placeholder}
      </label>
    </div>
  );
};

export default Input;
