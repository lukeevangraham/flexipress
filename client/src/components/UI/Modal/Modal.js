import classes from "./Modal.module.scss";
import Backdrop from "../Backdrop/Backdrop";

const Modal = ({ show, modalClosed, children }) => (
  <>
    <Backdrop show={show} clicked={modalClosed} />
    <div
      className={classes.Modal}
      style={{ visibility: show ? "visible" : "hidden" }}
    >
      {children}
    </div>
  </>
);

export default Modal;
