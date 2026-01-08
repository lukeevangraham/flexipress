import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Button from "../../../UI/Button/Button";
import server from "../../../../apis/server";
import { AgGridReact } from "ag-grid-react"; // React Grid Logic
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme

import classes from "./Home.module.scss";

const HomeInfoSingle = () => {
  const [topTextValue, setTopTextValue] = useState("");
  const [eventList, setEventList] = useState(null);
  const [featuredEventColDefs, setFeaturedEventColDefs] = useState(null);
  const [selectedRows, setSelectedRows] = useState(null);
  const [existingSingleId, setExistingSingleId] = useState(null);
  const { authUser } = useAuth();

  const gridRef = useRef();

  useEffect(() => {
    const fetchHomeInfo = async () => {
      try {
        const response = await server.get(`/single/home/${authUser.orgId}`);

        if (response.data) {
          setTopTextValue(response.data.topText || "");
          setExistingSingleId(response.data.id);
        }
      } catch (error) {
        console.error("Error fetching home info:", error);
      }
    };

    const fetchEvents = async () => {
      const eventListRes = await server.get(
        `/events/org/${authUser.orgId}?published=true`
      );

      setEventList(eventListRes.data);
      setFeaturedEventColDefs([
        { field: "name", filter: true, checkboxSelection: true, flex: 3 },
      ]);
    };

    fetchHomeInfo();
    fetchEvents();
  }, [setTopTextValue, authUser.orgId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (existingSingleId) {
      // Update existing home info
      try {
        const response = await server.put(`/single/home/${existingSingleId}`, {
          topText: topTextValue,
        });
        console.log("Home info updated:", response.data);
      } catch (error) {
        console.error("Error updating home info:", error);
      }
    } else {
      // Create new home info

      try {
        const response = await server.post("/single/home", {
          topText: topTextValue,
          orgId: authUser.orgId,
          userId: authUser.id,
        });
        console.log("Home info saved:", response.data);
      } catch (error) {
        console.error("Error saving home info:", error);
      }
    }
  };

  const editSelection = (
    <>
      {selectedRows && selectedRows.length ? <div>Event Selected</div> : null}
    </>
  );

  return (
    <div className={classes.HomeInfoSingle}>
      <h1>Home Info</h1>
      <Button clicked={handleSubmit}>Save</Button>
      <h4>Top Text</h4>
      <div className={classes.HomeInfoSingle__QuillContainer}>
        <ReactQuill
          theme="snow"
          value={topTextValue}
          onChange={setTopTextValue}
          className={classes.HomeInfoSingle__QuillContainer__Quill}
        />
      </div>
      <div>
        <h4>Featured Event(s)</h4>
        <div className={`ag-theme-quartz ${classes.grid}`}>
          <AgGridReact
            ref={gridRef}
            rowData={eventList}
            columnDefs={featuredEventColDefs}
            // gridOptions={{ pagination: true }}
            // onRowClicked={(event) => setClickedEvent(event.data)}
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
      </div>
    </div>
  );
};

export default HomeInfoSingle;
