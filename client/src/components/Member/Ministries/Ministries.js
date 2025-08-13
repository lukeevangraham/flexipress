import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useEffect, useState, useRef } from "react";
import server from "../../../apis/server";
import { AgGridReact } from "ag-grid-react";

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
    <div>
      <div>
        <h1>Ministries</h1>
        <div>
          <Link to="/ministries/add">
            Add a new ministry to {authUser.orgName}'s Flexipress
          </Link>
        </div>
        <div
          className="ag-theme-quartz"
          style={{ height: 400, width: "100%", marginTop: "20px" }}
        >
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
