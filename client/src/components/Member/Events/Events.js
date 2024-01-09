import axios from "axios";
import { useEffect, useState } from "react";
import Button from "../../UI/Button/Button";
import server from "../../../apis/server";
import { useAuth } from "../../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

const Events = () => {
  const { authUser } = useAuth();

  const [eventList, setEventList] = useState(null);
  const [colDefs, setColDefs] = useState(null);

  useEffect(() => {
    const getEvents = async () => {
      const eventListRes = await server.get(`/event/org/${authUser.orgId}`);

      // console.log("HERE: ", Object.keys(eventListRes.data[0]));

      let setupColDefs = [
        { field: "name", filter: true },
        { field: "startDatePretty", headerName: "Start Date" },
      ];

      let prettyDateEventList = [];

      // const prettyDateEventList = eventListRes.data.map((event) => {
      //   console.log("E: ", event);
      //   event.startDatePretty = new Date(event.startDate).toLocaleDateString(
      //     "en-US"
      //   );
      // });

      eventListRes.data.forEach((event) => {
        prettyDateEventList.push({
          ...event,
          startDatePretty: new Date(event.startDate).toLocaleDateString("en-US"),
        });
      });

      // Object.keys(eventListRes.data[0]).forEach((col) => {
      //   setupColDefs.push({ field: col });
      // });

      console.log("HERE: ", prettyDateEventList);

      setEventList(prettyDateEventList);
      setColDefs(setupColDefs);
    };

    getEvents();
  }, [setEventList, setColDefs]);

  // if (eventList && eventList.length) {
  //   let setupColDefs = [];

  //   Object.keys(eventList[0]).forEach((col) => {
  //     setupColDefs.push({ field: col });
  //   });

  //   console.log("DEFS: ", setupColDefs);

  //   setColDefs(setupColDefs);
  // }

  return (
    <>
      <h1>Events</h1>
      <Link to="/events/create">Create New Event</Link>
      <br />
      <br />
      {console.log("EL: ", eventList)}
      <h2>Event list</h2>
      <AgGridReact rowData={eventList} columnDefs={colDefs} />
      {/* {eventList
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
        : null} */}
    </>
  );
};

export default Events;
