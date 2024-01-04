import Button from "../../UI/Button/Button";
import { Link } from "react-router-dom";

const Events = () => {
  return (
    <>
      <h1>Events</h1>
      <Link to="/events/create">Create New Event</Link>

      <div>Event list</div>
    </>
  );
};

export default Events;
