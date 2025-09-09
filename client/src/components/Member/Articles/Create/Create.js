import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Input from "../../../UI/Input/Input";
import Button from "../../../UI/Button/Button";
import server, { getMinistries } from "../../../../apis/server";
import ReactQuill from "react-quill-new";

import classes from "./Create.module.scss";

const ArticleCreate = ({
  articleFromList,
  clearSelectedArticle,
  articles,
  setArticles,
  setSelectedRows,
}) => {
  const { authUser } = useAuth();

  const navigate = useNavigate();

  const [publish, setPublish] = useState(
    articleFromList && articleFromList.published ? true : false
  );

  const [publishEnabled, setPublishEnabled] = useState(
    articleFromList ? true : false
  );

  const [saveEnabled, setSaveEnabled] = useState(null);

  const [selectedArticle, setSelectedArticle] = useState(
    articleFromList ? articleFromList : null
  );

  const [bodyValue, setBodyValue] = useState(
    articleFromList ? articleFromList.body : ""
  );

  const [articleForm, setArticleForm] = useState({
    title: {
      elementType: "input",
      elementConfig: {
        type: "text",
        placeholder: "Article title",
      },
      value: selectedArticle ? selectedArticle.name : "",
      validation: {
        required: true,
      },
      width: "70%",
    },
    author: {
      elementType: "input",
      elementConfig: {
        type: "text",
        placeholder: "Article author",
      },
      value: selectedArticle ? selectedArticle.name : "",
      validation: {
        required: true,
      },
      width: "70%",
    },
    body: { elementType: "richtext" },
    embedCode: {
      elementType: "textarea",
      elementConfig: {
        minRows: 8,
        placeholder: "Embed Code (optional)",
      },
      value: selectedArticle ? selectedArticle.embedCode : "",
      validation: {
        required: false,
      },
    },
    // width: "50rem"},
    datePublished: {
      elementType: "date",
      elementConfig: {
        // timeInputLabel: "Time:",
        dateFormat: "MM/dd/yyyy",
        // showTimeInput: true,
        placeholder: "Publish date",
      },
      value: selectedArticle ? new Date(selectedArticle.startDate) : new Date(),
      validation: {
        required: true,
      },
    },
    image: {
      elementType: "image",
      elementConfig: {
        placeholder: "Image",
        url: selectedArticle ? selectedArticle.Image.url : "",
        file: "",
      },
      value: "",
      validation: {
        required: false,
      },
    },
    ministries: {
      elementType: "select",
      elementConfig: {
        options: [],
        multiple: true,
        // ministriesList.map()
        placeholder: "Ministries",
      },
      value: selectedArticle
        ? selectedArticle.Ministries.map((m) => m.id.toString())
        : [],
      validation: {
        required: false,
      },
      // width: "20rem",},
    },
  });

  useEffect(() => {
    getMinistries(authUser, setArticleForm);
  }, [authUser, setArticleForm]);

  const inputChangedHandler = (e, inputIdentifier) => {
    setSaveEnabled(true);
    const updatedArticleForm = {
      ...articleForm,
    };
    const updatedFormElement = {
      ...updatedArticleForm[inputIdentifier],
    };

    if (updatedFormElement.elementType === "date") {
      updatedFormElement.value = e;
    } else if (updatedFormElement.elementType === "image") {
      updatedFormElement.elementConfig.url = URL.createObjectURL(
        e.target.files[0]
      );
      updatedFormElement.elementConfig.file = e.target.files[0];
    } else if (updatedFormElement.elementType === "richtext") {
      updatedFormElement.value = e.target;
    } else if (updatedFormElement.elementType === "select") {
      const selectedOptions = Array.from(e.target.selectedOptions).map(
        (option) => option.value
      );
      updatedFormElement.value = selectedOptions;
    } else {
      updatedFormElement.value = e.target.value;
    }

    updatedFormElement.touched = true;
    updatedArticleForm[inputIdentifier] = updatedFormElement;
    setArticleForm(updatedArticleForm);
  };

  const formElementsArray = [];
  for (let key in articleForm) {
    formElementsArray.push({
      id: key,
      config: articleForm[key],
    });
  }

  const form = (
    <form encType="multipart/form-data">
      {formElementsArray.map((formElement) => {
        if (formElement.config.elementType === "richtext") {
          return (
            <ReactQuill
              theme="snow"
              value={bodyValue}
              onChange={setBodyValue}
              key={formElement.id}
              className={classes.EventSubmission__Quill}
              modules={{
                toolbar: [
                  [{ header: [1, 2, false] }],
                  ["bold", "italic", "underline"],
                  ["link", "image"],
                  ["clean"],
                ],
              }}
            />
          );
        } else {
          return (
            <Input
              key={formElement.id}
              elementType={formElement.config.elementType}
              elementConfig={formElement.config.elementConfig}
              value={formElement.config.value}
              changed={(e) => inputChangedHandler(e, formElement.id)}
              required={formElement.config.validation.required}
              width={formElement.config.width}
            />
          );
        }
      })}
    </form>
  );

  const handlePublish = async (e) => {
    e.preventDefault();
    console.log("handle this publish");
  };
  const handleSubmit = async (e) => {
    console.log("handle this submit");
    e.preventDefault();

    let articleFormValues = new FormData();

    articleFormValues.append("title", articleForm.title.value);
    articleFormValues.append("author", articleForm.author.value);
    articleFormValues.append("body", bodyValue);
    articleFormValues.append("embedCode", articleForm.embedCode.value);
    articleFormValues.append("datePublished", articleForm.datePublished.value);
    articleFormValues.append("image", articleForm.image.elementConfig.file);
    articleFormValues.append("ministries", articleForm.ministries.value);
    articleFormValues.append("OrganizationId", authUser.orgId);

    let articleResponse;

    if (selectedArticle) {
      articleFormValues.append("id", selectedArticle.id);
      articleResponse = await server.put("/article", articleFormValues);
    } else {
      articleResponse = await server.post("/article", articleFormValues, {
        headers: {
          "content-type": "multipart/form-data",
        },
      });
    }

    const res = articleResponse;

    if (res.status === 200) {
      setPublishEnabled(true);
      setSelectedArticle(res.data);

      if (selectedArticle) {
        console.log("res: ", res.data);
        const revisedArticles = articles.map((article) => {
          return article.id === selectedArticle.id ? { ...res.data } : article;
        });

        setArticles(revisedArticles);
      }
    }
  };

  return (
    <div className={classes.ArticleCreate}>
      <div className={classes.ArticleCreate__TopInfo}>
        <h2>{selectedArticle ? `Edit an` : `Create a new`} article</h2>
        <div className={classes.ArticleCreate__TopInfo__Buttons}>
          <Button
            disabled={publishEnabled ? false : true}
            clicked={handlePublish}
          >
            {publish ? "Unpublish" : "Publish"}
          </Button>
          <Button disabled={saveEnabled ? false : true} clicked={handleSubmit}>
            Save
          </Button>
        </div>
      </div>

      {form}
    </div>
  );
};

export default ArticleCreate;
