import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Button from "../../../UI/Button/Button";
import server from "../../../../apis/server";

import classes from "./Home.module.scss";

const HomeInfoSingle = () => {
  const [topTextValue, setTopTextValue] = useState("");
  const [existingSingleId, setExistingSingleId] = useState(null);
  const { authUser } = useAuth();

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

    fetchHomeInfo();
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

  return (
    <div className={classes.HomeInfoSingle}>
      <h1>Home Info</h1>
      <Button clicked={handleSubmit}>Save</Button>
      <div>Top Text</div>
      <div className={classes.HomeInfoSingle__QuillContainer}>
        <ReactQuill
          theme="snow"
          value={topTextValue}
          onChange={setTopTextValue}
          className={classes.HomeInfoSingle__QuillContainer__Quill}
        />
      </div>
    </div>
  );
};

export default HomeInfoSingle;
