import axios from "axios";
import { useEffect, useState } from "react";
import Button from "../../UI/Button/Button";
import server from "../../../apis/server";
import { useAuth } from "../../../contexts/AuthContext";
import { Link } from "react-router-dom";

const Events = () => {
  const { authUser } = useAuth();

  const [eventList, setEventList] = useState(null);

  useEffect(() => {
    const getEvents = async () => {
      const eventListRes = await server.get(`/event/org/${authUser.orgId}`);

      setEventList(eventListRes.data);
    };

    getEvents();
  }, [setEventList]);

  return (
    <>
      <h1>Events</h1>
      <Link to="/events/create">Create New Event</Link>
      <br />
      <br />
      <h2>Event list</h2>
      {eventList
        ? eventList.map((event) => (
            <div key={event.id} style={{ display: "flex" }}>
              <div>{`${event.name} @ ${new Date(
                event.startDate
              ).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                year: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}`}</div>
            </div>
          ))
        : null}
    </>
  );
};

export default Events;
