import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import server from "../../../apis/server";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme

import classes from "./Volunteer.module.scss";

const VolunteerPositions = () => {
  const { authUser } = useAuth();

  const [volunteerPositions, setVolunteerPositions] = useState(null);
  const [colDefs, setColDefs] = useState(null);
  const [clickedPosition, setClickedPosition] = useState(null);
  const [selectedRows, setSelectedRows] = useState(null);

  const gridRef = useRef();

  let setupColDefs = [
    { field: "position", filter: true },
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

  return (
    <>
      <h1>Volunteer Positions</h1>
      <>
        <Link to="/volunteer/create">Create New Volunteer Position</Link>
      </>
      <br />
      <br />
      <h2>Volunteer Position List</h2>
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
