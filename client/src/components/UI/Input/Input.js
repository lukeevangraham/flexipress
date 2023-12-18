import React from "react";

import classes from "./Input.module.scss";

const Input = ({ elementType, elementConfig, value, changed, required }) => {
    let inputElement = null;
    const inputClasses = [classes.input]

    switch (elementType) {
        case "input":
            inputElement = (
                <input className={inputClasses.join(" ")} {...elementConfig} value={value} onChange={changed} name={elementConfig.placeholder} required={required ? true : null} />
            )
            break;
        default:
            break;
    }

    return (
        <div className={classes.inputGroup}>
            {inputElement}
            <label htmlFor={elementConfig.placeholder} className={classes.label}>{elementConfig.placeholder}</label>
        </div>
    )
}

export default Input;