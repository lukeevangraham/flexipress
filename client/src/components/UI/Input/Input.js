import React from "react";
import DatePicker from "react-datepicker";
import TextareaAutosize from "react-textarea-autosize";
import "react-datepicker/dist/react-datepicker.css";

import classes from "./Input.module.scss";

const Input = ({
  elementType,
  elementConfig,
  value,
  changed,
  required,
  width,
}) => {
  let inputElement = null;
  const inputClasses = [classes.input];

  switch (elementType) {
    case "input":
      inputElement = (
        <input
          className={`${classes.input}`}
          {...elementConfig}
          value={value}
          onChange={changed}
          name={elementConfig.placeholder}
          required={required ? true : null}
          style={{ width: width ? width : "100%" }}
        />
      );
      break;
    case "date":
      inputElement = (
        <div>
          <DatePicker
            {...elementConfig}
            selected={value}
            onChange={changed}
            required={required ? true : null}
            name={elementConfig.placeholder}
          />
        </div>
      );
      break;
    case "textarea":
      inputElement = (
        <TextareaAutosize
          className={classes.input}
          {...elementConfig}
          value={value}
          onChange={changed}
          name={elementConfig.placeholder}
          required={required ? true : null}
          style={{ width: width ? width : "100%" }}
        />
      );
      break;
    case "image":
      inputElement = (
        <>
          {elementConfig.url ? (
            <img src={elementConfig.url} className={classes.image} alt="" />
          ) : null}
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
      break;
    case "select":
      inputElement = (
        <select
          className={inputClasses.join(" ")}
          value={value}
          onChange={changed}
        >
          {elementConfig.option.map((option) => (
            <option key={option.value} value={option.value}>
              {option.displayValue}
            </option>
          ))}
        </select>
      );
      break;
    // case "richtext":
    //   inputElement = (
    //     // <QuillComponent value={value} setValue={changed} {...elementConfig} />
    //     // <ReactQuill
    //     //   theme="snow"
    //     //   value={value}
    //     //   onChange={changed}
    //     //   {...elementConfig}
    //     //   name={elementConfig.placeholder}
    //     // />
    //     // <SlateComponent value />
    //     // <Tiptap />
    //   );
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
