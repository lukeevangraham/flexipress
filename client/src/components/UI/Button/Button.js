import React from "react";

import classes from "./Button.module.scss";

const Button = ({ color, children, clicked, disabled, small }) => (
  <>
    {disabled ? (
      <button
        className={`${classes.btn} ${classes[`disabled`]}`}
        onClick={null}
      >
        {children}
      </button>
    ) : (
      <button
        className={`${classes.btn} ${classes[color]} ${
          small ? classes.small : ""
        }`}
        onClick={clicked}
      >
        {children}
      </button>
    )}
  </>
);

export default Button;
