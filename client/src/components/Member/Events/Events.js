import axios from "axios";
import { useEffect, useState } from "react";
import Button from "../../UI/Button/Button";
import server from "../../../apis/server";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import CreateEvent from "./Create/Create";
import { AgGridReact } from "ag-grid-react"; // React Grid Logic
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme

const Events = () => {
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const [eventList, setEventList] = useState(null);
  const [colDefs, setColDefs] = useState(null);

  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const getEvents = async () => {
      const eventListRes = await server.get(`/event/org/${authUser.orgId}`);

      // console.log("HERE: ", Object.keys(eventListRes.data[0]));

      let setupColDefs = [];

      // let setupColDefs = [
      //   { field: "name", filter: true },
      //   { field: "startDatePretty", headerName: "Start Date" },
      // ];

      let prettyDateEventList = [];

      // const prettyDateEventList = eventListRes.data.map((event) => {
      //   console.log("E: ", event);
      //   event.startDatePretty = new Date(event.startDate).toLocaleDateString(
      //     "en-US"
      //   );
      // });

      // eventListRes.data.forEach((event) => {
      //   prettyDateEventList.push({
      //     ...event,
      //     startDatePretty: new Date(event.startDate).toLocaleDateString(
      //       "en-US"
      //     ),
      //   });
      // });

      Object.keys(eventListRes.data[0]).forEach((col) => {
        col === "startDate" || col === "endDate"
          ? setupColDefs.push({
              field: col,
              valueFormatter: (params) => {
                return new Date(params.value).toLocaleDateString();
              },
            })
          : setupColDefs.push({ field: col });

        // setupColDefs.push({ field: col });
        // if (col === "startDate") {

        // }
      });

      setEventList(eventListRes.data);
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
      {selectedEvent ? (
        <>
          <CreateEvent
            selectedEvent={selectedEvent}
            clearSelectedEvent={setSelectedEvent}
            events={eventList}
            setEvents={setEventList}
          />
        </>
      ) : (
        <>
          <Link to="/events/create">Create New Event</Link>
          <br />
          <br />
          <h2>Event list</h2>
          <div className="ag-theme-quartz" style={{ height: 500 }}>
            <AgGridReact
              rowData={eventList}
              columnDefs={colDefs}
              gridOptions={{ pagination: true }}
              onRowClicked={(event) => setSelectedEvent(event.data)}
              autoSizeStrategy={{
                type: "fitCellContents",
                // defaultMinWidth: 600,
                // columnLimits: [
                //   {
                //     colId: "country",
                //     minWidth: 900,
                //   },
                // ],
              }}
            />
          </div>
        </>
      )}
    </>
  );
};

export default Events;
