import { Link } from "react-router-dom";
import Button from "../../UI/Button/Button";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import server from "../../../apis/server";
import { AgGridReact } from "ag-grid-react";
import Modal from "../../UI/Modal/Modal";
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme

import classes from "./Volunteer.module.scss";

const VolunteerPositions = () => {
  const { authUser } = useAuth();

  const [volunteerPositions, setVolunteerPositions] = useState(null);
  const [colDefs, setColDefs] = useState(null);
  const [clickedPosition, setClickedPosition] = useState(null);
  const [selectedRows, setSelectedRows] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const gridRef = useRef();

  let setupColDefs = [
    { field: "position", filter: true, checkboxSelection: true },
    { field: "sponsoringMinistry" },
    { field: "primaryContact" },
    { field: "frequency" },
  ];

  useEffect(() => {
    const getVolunteerPositions = async () => {
      const volunteerListRes = await server.get(
        `/volunteer/org/${authUser.orgId}`
      );

      setVolunteerPositions(volunteerListRes.data);
      setColDefs(setupColDefs);
    };

    getVolunteerPositions();
  }, [setVolunteerPositions, setColDefs]);

  const deletePosition = async () => {
    const deletedResponse = await server.delete(
      `/volunteer/${selectedRows[0].id}`
    );

    if (deletedResponse.status === 200) {
      const trimmedPositions = volunteerPositions.filter(
        (position) => position.id !== selectedRows[0].id
      );
      setVolunteerPositions(trimmedPositions);
      setSelectedRows(null);
    }
  };

  const editSelection = (
    <>
      {selectedRows && selectedRows.length ? (
        <div className={classes.editGrid}>
          <div>{selectedRows.length} Position Selected</div>
          <Button clicked={() => setShowModal(true)}>Delete</Button>
        </div>
      ) : null}
    </>
  );

  return (
    <>
      <h1>Volunteer Positions</h1>
      {selectedRows && selectedRows.length ? (
        <Modal show={showModal} modalClosed={() => setShowModal(false)}>
          <div className={classes.editModal}>
            <div>
              Are you sure you want to delete {selectedRows[0].position}?
            </div>
            <div className={classes.editModal__Buttons}>
              <Button clicked={() => setShowModal(false)}>Cancel</Button>
              <Button clicked={deletePosition} color={"ghost"}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
      <>
        <Link to="/volunteer/create">Create New Volunteer Position</Link>
      </>
      <br />
      <br />
      <h2>Volunteer Position List</h2>
      {editSelection}
      <div className={`ag-theme-quartz ${classes.grid}`}>
        <AgGridReact
          ref={gridRef}
          rowData={volunteerPositions}
          columnDefs={colDefs}
          gridOptions={{ pagination: true }}
          onRowClicked={(position) => setClickedPosition(position.data)}
          rowSelection="single"
          onSelectionChanged={() =>
            setSelectedRows(gridRef.current.api.getSelectedRows())
          }
        />
      </div>
    </>
  );
};

export default VolunteerPositions;
