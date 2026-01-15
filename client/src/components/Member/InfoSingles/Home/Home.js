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
  const [headlineEventId, setHeadlineEventId] = useState("");
  // const [selectedRows, setSelectedRows] = useState(null);
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
          setHeadlineEventId(response.data.HeadlineEventId || "");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      topText: topTextValue,
      HeadlineEventId: headlineEventId === "" ? null : headlineEventId, // Send null if empty
    };

    if (existingSingleId) {
      try {
        const response = await server.put(
          `/single/home/${existingSingleId}`,
          payload
        );
        console.log("Home info updated:", response.data);
      } catch (error) {
        console.error("Error updating home info:", error);
      }
    } else {
      try {
        const response = await server.post("/single/home", {
          ...payload,
          orgId: authUser.orgId,
          userId: authUser.id,
        });
        setExistingSingleId(response.data.id); // Set the ID after first creation
      } catch (error) {
        console.error("Error saving home info:", error);
      }
    }
  };

  return (
    <div className={classes.HomeInfoSingle}>
      <h1>Home Page Management</h1>
      <Button clicked={handleSubmit}>Save</Button>
      <h2>Top Text</h2>
      <div className={classes.HomeInfoSingle__QuillContainer}>
        <ReactQuill
          theme="snow"
          value={topTextValue}
          onChange={setTopTextValue}
          className={classes.HomeInfoSingle__QuillContainer__Quill}
        />
      </div>

      {/* <hr className={classes.Divider} /> */}

      <div className={classes.HomeInfoSingle__HeadlineRow}>
        <h2>Headline Event (Hero Section)</h2>
        <div className={classes.HeadlineBox}>
          <select
            value={headlineEventId}
            onChange={(e) => setHeadlineEventId(e.target.value)}
          >
            <option value="">-- No Headline Event Selected --</option>
            {eventList.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
          <p className={classes.HelpText}>
            Note: This event will be featured prominently at the very top of the
            homepage.
          </p>
        </div>
      </div>

      {/* <hr className={classes.Divider} /> */}

      <div className={classes.HomeInfoSingle__FeaturedItems}>
        {/* FEATURE EVENTS */}
        <FeatureManager
          title={"Event Spotlight"}
          itemType="Event"
          rowData={eventList}
          onToggle={(item) =>
            handleToggle(item, eventList, setEventList, "events")
          }
        />

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
      </div>
    </div>
  );
};

export default HomeInfoSingle;
