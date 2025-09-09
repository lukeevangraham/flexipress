import { useEffect, useState, useRef } from "react";
import Button from "../../UI/Button/Button";
import server from "../../../apis/server";
import { useAuth } from "../../../contexts/AuthContext";
import { Link } from "react-router-dom";
import ArticleCreate from "./Create/Create";
import Modal from "../../UI/Modal/Modal";
import { AgGridReact } from "ag-grid-react"; // React Grid Logic
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme

import classes from "./Articles.module.scss";

const Articles = () => {
  const { authUser } = useAuth();

  const [articleList, setArticleList] = useState(null);
  const [colDefs, setColDefs] = useState(null);
  const [clickedArticle, setClickedArticle] = useState(null);
  const [selectedRows, setSelectedRows] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const gridRef = useRef();

  return (
    <>
      <h1>Articles</h1>
      <>
        <Link to="/articles/create">Create New Article</Link>
      </>
    </>
  );
};

export default Articles;
