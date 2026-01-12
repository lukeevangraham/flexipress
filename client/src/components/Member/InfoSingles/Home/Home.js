import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Button from "../../../UI/Button/Button";
import FeatureManager from "../../../Member/FeatureManager/FeatureManager";
import server from "../../../../apis/server";
import { AgGridReact } from "ag-grid-react"; // React Grid Logic
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme

import classes from "./Home.module.scss";

const HomeInfoSingle = () => {
  const [topTextValue, setTopTextValue] = useState("");
  const [eventList, setEventList] = useState([]);
  const [articleList, setArticleList] = useState([]);
  // const [featuredEventColDefs, setFeaturedEventColDefs] = useState(null);
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
    };

    const fetchArticles = async () => {
      const articleListRes = await server.get(
        `/articles/org/${authUser.orgId}?published=true`
      );

      setArticleList(articleListRes.data);
    };

    fetchHomeInfo();
    fetchEvents();
    fetchArticles();
  }, [
    setTopTextValue,
    setArticleList,
    setEventList,
    setExistingSingleId,
    authUser.orgId,
  ]);

  // // 1. Derived Lists: These update automatically when eventList changes
  // const featuredEvents = useMemo(
  //   () => eventList.filter((e) => e.isFeaturedOnHome),
  //   [eventList]
  // );

  // const availableEvents = useMemo(
  //   () => eventList.filter((e) => !e.isFeaturedOnHome),
  //   [eventList]
  // );

  // NEW TOGGLE FUNCTION FOR GENERIC FEATURE MANAGER
  const handleToggle = async (item, list, setList, type) => {
    console.log("type: ", type);
    const newStatus = !item.isFeaturedOnHome;

    // 1. UI Update
    setList(
      list.map((i) =>
        i.id === item.id ? { ...i, isFeaturedOnHome: newStatus } : i
      )
    );

    // 2. DB Update
    try {
      await server.patch(`/${type}/${item.id}/feature`, {
        isFeaturedOnHome: newStatus,
      });
    } catch (error) {
      console.error("Failed to save", error);
      // Revert UI change on error
      setList(
        list.map((i) =>
          i.id === item.id
            ? { ...i, isFeaturedOnHome: item.isFeaturedOnHome }
            : i
        )
      );
    }
  };

  // // 2. The Toggle Function
  // const toggleFeature = useCallback(async (event) => {
  //   const newStatus = !event.isFeaturedOnHome;

  //   // Optimistic UI Update: Move it in the UI immediately
  //   setEventList((prev) =>
  //     prev.map((item) =>
  //       item.id === event.id ? { ...item, isFeaturedOnHome: newStatus } : item
  //     )
  //   );

  //   try {
  //     // PERSIST TO TB
  //     await server.patch(`/events/${event.id}/feature`, {
  //       isFeaturedOnHome: newStatus,
  //     });
  //   } catch (error) {
  //     console.error("Error updating featured status:", error);
  //     // Revert UI change on error
  //     setEventList((prev) =>
  //       prev.map((item) =>
  //         item.id === event.id
  //           ? { ...item, isFeaturedOnHome: event.isFeaturedOnHome }
  //           : item
  //       )
  //     );
  //   }
  // }, []);

  // // DEALING WITH COLUMN DEFS
  // const featuredColDefs = [
  //   { field: "name", filter: true, flex: 3 },
  //   {
  //     headerName: "Action",
  //     cellRenderer: (params) => (
  //       <Button clicked={() => toggleFeature(params.data)}>Remove</Button>
  //     ),
  //     width: 120,
  //   },
  // ];

  // const availableColDefs = [
  //   { field: "name", filter: true, flex: 3 },
  //   {
  //     headerName: "Action",
  //     cellRenderer: (params) => (
  //       <Button clicked={() => toggleFeature(params.data)}>Feature</Button>
  //     ),
  //     width: 120,
  //   },
  // ];

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
      <h1>Home Page Management</h1>
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

      {/* FEATURE EVENTS */}
      <FeatureManager
        title={"Event Spotlight"}
        itemType="Event"
        rowData={eventList}
        onToggle={(item) =>
          handleToggle(item, eventList, setEventList, "events")
        }
      />

      <hr />

      {/* FEATURE ARTICLES */}
      <FeatureManager
        title={"Article Spotlight"}
        itemType="Article"
        nameField="title"
        rowData={articleList}
        onToggle={(item) =>
          handleToggle(item, articleList, setArticleList, "articles")
        }
      />

      {/* SECTION 1: THE FEATURED EVENTS */}
      {/* <div>
        <h4>Currently Featured Events</h4>
        <div className={`ag-theme-quartz ${classes.grid}`}>
          <AgGridReact
            rowData={featuredEvents}
            columnDefs={featuredColDefs}
            domLayout="autoHeight"
            overlayNoRowsTemplate="No events featured yet."
          />
        </div>
      </div> */}

      {/* SECTION 2: AVAILABLE EVENTS TO FEATURE */}
      {/* <div>
        <h4>Add Featured Event (Search below)</h4>
        <div className={`ag-theme-quartz ${classes.grid}`}>
          <AgGridReact
            rowData={availableEvents}
            columnDefs={availableColDefs}
            domLayout="autoHeight"
            pagination={true}
            paginationPageSize={10}
            overlayNoRowsTemplate="No available events to feature."
          />
        </div>
      </div> */}

      {/* <div>
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
      </div> */}
    </div>
  );
};

export default HomeInfoSingle;
