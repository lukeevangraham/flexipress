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

  useEffect(() => {
    const getArticles = async () => {
      const articleListRes = await server.get(
        `/articles/org/${authUser.orgId}`
      );

      setArticleList(articleListRes.data);
      setColDefs([
        { field: "title", filter: true, checkboxSelection: true, flex: 3 },
        {
          field: "author",
          flex: 1,
        },
        {
          field: "published",
          flex: 1,
        },
      ]);
    };
    getArticles();
  }, [setArticleList, setColDefs, authUser]);

  const editSelection = (
    <>
      {selectedRows && selectedRows.length ? (
        <div className={classes.editGrid}>
          <div>{selectedRows.length} Article Selected</div>
          <Button clicked={() => setShowModal(true)}>Delete</Button>
        </div>
      ) : null}
    </>
  );

  return (
    <>
      <h1>Articles</h1>
      {selectedRows && selectedRows.length ? (
        <Modal show={showModal} modalClosed={() => setShowModal(false)}>
          <div className={classes.editModal}>
            <div>Are you sure you want to delete {selectedRows[0].title}?</div>
            <div className={classes.editModal__Buttons}>
              <Button clicked={() => setShowModal(false)}>Cancel</Button>
              <Button
                clicked={async () => {
                  const deleteResponse = await server.delete(
                    `/article/${selectedRows[0].id}`
                  );

                  if (deleteResponse.status === 200) {
                    const trimmedArticleList = articleList.filter(
                      (article) => article.id !== selectedRows[0].id
                    );
                    setArticleList(trimmedArticleList);
                    setSelectedRows(null);
                    setShowModal(false);
                    setClickedArticle(null);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
      {clickedArticle ? (
        <ArticleCreate
          articleFromList={clickedArticle}
          clearSelectedArticle={setClickedArticle}
          articles={articleList}
          setArticles={setArticleList}
          setSelectedRows={setSelectedRows}
        />
      ) : (
        <>
          <>
            <Link to="/articles/create">Create New Article</Link>
          </>
          <br />
          <br />
          <h2>Article List</h2>
          {editSelection}
          <div className={`ag-theme-quartz ${classes.grid}`} style={{}}>
            <AgGridReact
              ref={gridRef}
              rowData={articleList}
              columnDefs={colDefs}
              rowSelection="single"
              onRowClicked={(event) => setClickedArticle(event.data)}
              onSelectionChanged={() => {
                setSelectedRows(gridRef.current.api.getSelectedRows());
              }}
            />
          </div>
          <br />
        </>
      )}
    </>
  );
};

export default Articles;
