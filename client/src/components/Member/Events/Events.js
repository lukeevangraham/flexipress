import { useEffect, useState, useRef } from "react";
import Button from "../../UI/Button/Button";
import server from "../../../apis/server";
import { useAuth } from "../../../contexts/AuthContext";
import { Link } from "react-router-dom";
import CreateEvent from "./Create/Create";
import Modal from "../../UI/Modal/Modal";
import { AgGridReact } from "ag-grid-react"; // React Grid Logic
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme

import classes from "./Events.module.scss";

const Events = () => {
  const { authUser } = useAuth();

  const [eventList, setEventList] = useState([]);
  const [colDefs, setColDefs] = useState([]);
  const [clickedEvent, setClickedEvent] = useState(null);
  const [selectedRows, setSelectedRows] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const gridRef = useRef();

  useEffect(() => {
    const getEvents = async () => {
      // GUARD: Only fetch if we actually have an orgId
      if (!authUser || !authUser.orgId) return;

      try {
        const eventListRes = await server.get(`/events/org/${authUser.orgId}`);
        setEventList(eventListRes.data || []); // Fallback to empty array

        setColDefs([
          { field: "name", filter: true, checkboxSelection: true, flex: 3 },
          {
            field: "startDate",
            flex: 1,
            valueFormatter: (params) =>
              new Date(params.value).toLocaleDateString(),
          },
          { field: "location", flex: 2 },
          { field: "published", flex: 1 },
          {
            field: "updatedAt",
            flex: 1,
            valueFormatter: (params) =>
              new Date(params.value).toLocaleDateString(),
          },
        ]);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };

    getEvents();
  }, [authUser]);

  const deleteEvent = async () => {
    try {
      const deleteResponse = await server.delete(
        `/event/${selectedRows[0].id}`,
      );

      if (deleteResponse.status === 200) {
        // 1. Close the modal first to prevent UI flickering
        setShowModal(false);

        // 2. Filter the list
        const trimmedEventList = eventList.filter(
          (event) => event.id !== selectedRows[0].id,
        );

        // 3. Update state and CLEAR selection completely
        setEventList(trimmedEventList);
        setSelectedRows(null);

        // 4. Force AG Grid to deselect everything
        gridRef.current.api.deselectAll();
      }
    } catch (err) {
      console.error("Delete failed:", err);
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
      {console.log({ EventList: eventList })}
      <h1>Events</h1>
      {selectedRows && selectedRows.length ? (
        <Modal show={showModal} modalClosed={() => setShowModal(false)}>
          <div className={classes.editModal}>
            <div>Are you sure you want to delete {selectedRows[0].name}?</div>
            <div className={classes.editModal__Buttons}>
              <Button clicked={() => setShowModal(false)}>Cancel</Button>
              <Button clicked={deleteEvent} color={"ghost"}>
                Delete
              </Button>
            </div>
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
            setSelectedRows={setSelectedRows}
          />
        </>
      ) : (
        <>
          <Link to="/events/create">Create New Event</Link>
          <br />
          <br />
          <h2>Event list</h2>
          {editSelection}
          <div className={`ag-theme-quartz ${classes.grid}`}>
            <AgGridReact
              ref={gridRef}
              rowData={eventList}
              columnDefs={colDefs}
              gridOptions={{ pagination: true }}
              onRowClicked={(event) => setClickedEvent(event.data)}
              // autoSizeStrategy={{
              //   type: "fitCellContents",
              // }}
              rowSelection="single"
              onSelectionChanged={() =>
                setSelectedRows(gridRef.current.api.getSelectedRows())
              }
              domLayout="autoHeight"
            />
          </div>
        </>
      )}
    </>
  );
};

export default Events;
