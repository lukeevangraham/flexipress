import React from "react"

import classes from "./Button.module.scss"

const Button = ({ color, children, clicked }) => (
    <button className={`${classes.btn} ${classes[color]}`} onClick={clicked}>{children}</button>
)

export default Button;