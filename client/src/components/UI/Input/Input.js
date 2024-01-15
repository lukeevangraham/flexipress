import React from "react";
import DatePicker from "react-datepicker";
import TextareaAutosize from "react-textarea-autosize";
import ImageEdit from "../ImageEdit/ImageEdit";

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
        <div>
          <DatePicker
            {...elementConfig}
            //   selected={startDate}
            selected={value}
            onChange={changed}
            required={required ? true : null}
            name={elementConfig.placeholder}
            //   onChange={(date) => setStartDate(date)}
            //   timeInputLabel="Time:"
            //   dateFormat="MM/dd/yyyy h:mm aa"
            //   showTimeInput
          />
        </div>
      );
      break;
    case "textarea":
      inputElement = (
        <TextareaAutosize
          {...elementConfig}
          value={value}
          onChange={changed}
          name={elementConfig.placeholder}
          required={required ? true : null}
        />
      );
      break;
    case "image":
      inputElement = (
        <>
          {elementConfig.url ? <img src={elementConfig.url} className={classes.image} alt="" /> : null}
          <input
            type="file"
            {...elementConfig}
            name={elementConfig.placeholder}
            id="image"
            onChange={changed}
            required={required ? true : null}
          />
        </>
      );
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
