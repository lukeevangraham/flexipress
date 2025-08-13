import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import server from "../../../apis/server";
import { AgGridReact } from "ag-grid-react";

import classes from "./Ministries.module.scss";

const Ministries = () => {
  const { authUser } = useAuth();
  const [ministries, setMinistries] = useState([]);
  const [colDefs, setColDefs] = useState(null);
  const [clickedMinistry, setClickedMinistry] = useState(null);
  const [selectedRows, setSelectedRows] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const gridRef = useRef();

  useEffect(() => {
    const getMinistries = async () => {
      const ministryListRes = await server.get(`/ministries/${authUser.orgId}`);
      setMinistries(ministryListRes.data);
      setColDefs([
        { field: "name", filter: true, checkboxSelection: true, flex: 3 },
        { field: "description", flex: 4 },
        {
          field: "createdAt",
          flex: 2,
          valueFormatter: (params) =>
            new Date(params.value).toLocaleDateString(),
        },
      ]);
    };

    getMinistries();
  }, [setMinistries, setColDefs, authUser]);

  return (
    <div className={classes.Ministries}>
      <div>
        <h1>Ministries</h1>

        <Link to="/ministries/add">Add a new ministry</Link>

        <br />
        <br />
        <h2>Ministries List</h2>
        <div className={`ag-theme-quartz ${classes.grid}`}>
          <AgGridReact
            ref={gridRef}
            rowData={ministries}
            columnDefs={colDefs}
            rowSelection="single"
            onSelectionChanged={(event) => {
              const selected = event.api.getSelectedRows();
              setSelectedRows(selected);
              if (selected.length > 0) {
                setClickedMinistry(selected[0]);
              } else {
                setClickedMinistry(null);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Ministries;
