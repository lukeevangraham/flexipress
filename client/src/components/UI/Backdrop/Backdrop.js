import classes from "./Backdrop.module.scss";

const Backdrop = ({ show, clicked }) =>
  show ? (
    <div
      className={
        show
          ? `${classes.Backdrop} ${classes.Backdrop__show}`
          : `${classes.Backdrop} ${classes.Backdrop__hidden}`
      }
      onClick={clicked}
    ></div>
  ) : null;

export default Backdrop;
