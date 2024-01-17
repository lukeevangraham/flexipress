import axios from "axios";
import { useEffect, useState, useRef } from "react";
import Button from "../../UI/Button/Button";
import server from "../../../apis/server";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import CreateEvent from "./Create/Create";
import Modal from "../../UI/Modal/Modal";
import { AgGridReact } from "ag-grid-react"; // React Grid Logic
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme

import classes from "./Events.module.scss";

const Events = () => {
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const [eventList, setEventList] = useState(null);
  const [colDefs, setColDefs] = useState(null);
  const [clickedEvent, setClickedEvent] = useState(null);
  const [selectedRows, setSelectedRows] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const gridRef = useRef();

  useEffect(() => {
    const getEvents = async () => {
      const eventListRes = await server.get(`/event/org/${authUser.orgId}`);

      let setupColDefs = [
        { field: "name", filter: true, checkboxSelection: true },
        {
          field: "startDate",
          valueFormatter: (params) => {
            return new Date(params.value).toLocaleDateString();
          },
        },
        { field: "location" },
        { field: "published" },
      ];

      // Object.keys(eventListRes.data[0]).forEach((col) => {
      //   col === "startDate" || col === "endDate"
      //     ? setupColDefs.push({
      //         field: col,
      // valueFormatter: (params) => {
      //   return new Date(params.value).toLocaleDateString();
      // },
      //       })
      //     : setupColDefs.push({ field: col, filter: true });
      // });

      setEventList(eventListRes.data);
      setColDefs(setupColDefs);
    };

    getEvents();
  }, [setEventList, setColDefs]);

  const deleteEvent = async () => {
    const deleteResponse = await server.delete(`/event/${selectedRows[0].id}`);

    console.log("lets delete an event", deleteResponse);

    if (deleteResponse.status === 200) {
      const trimmedEventList = eventList.filter(
        (event) => event.id !== selectedRows[0].id
      );
      setSelectedRows(null);
    }
  };

  const editSelection = (
    <>
      {selectedRows && selectedRows.length ? (
        <div className={classes.editGrid}>
          <div>{selectedRows.length} Event Selected</div>
          <Button clicked={() => setShowModal(true)}>Delete</Button>
        </div>
      ) : null}
    </>
  );

  return (
    <>
      <h1>Events</h1>
      {selectedRows && selectedRows.length ? (
        <Modal show={showModal} modalClosed={() => setShowModal(false)}>
          <div className={classes.editModal}>
            <div>Are you sure you want to delete {selectedRows[0].name}?</div>
            <Button clicked={deleteEvent}>Delete</Button>
          </div>
        </Modal>
      ) : null}
      {clickedEvent ? (
        <>
          <CreateEvent
            eventFromList={clickedEvent}
            clearSelectedEvent={setClickedEvent}
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
          {editSelection}
          <div
            className={`ag-theme-quartz ${classes.grid}`}
            style={{ height: 500 }}
          >
            <AgGridReact
              ref={gridRef}
              rowData={eventList}
              columnDefs={colDefs}
              gridOptions={{ pagination: true }}
              onRowClicked={(event) => setClickedEvent(event.data)}
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
              rowSelection="single"
              onSelectionChanged={() =>
                setSelectedRows(gridRef.current.api.getSelectedRows())
              }
            />
          </div>
        </>
      )}
    </>
  );
};

export default Events;
