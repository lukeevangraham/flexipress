import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Input from "../../../UI/Input/Input";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Button from "../../../UI/Button/Button";
import server from "../../../../apis/server";

import classes from "./Create.module.scss";

const VolunteerCreate = ({
  volunteerPositionFromList,
  clearSelectedPosition,
  positions,
  setPositions,
  setSelectedRows,
}) => {
  const [descriptionValue, setDescriptionValue] = useState(
    volunteerPositionFromList ? volunteerPositionFromList.description : ""
  );
  const [saveEnabled, setSaveEnabled] = useState(null);

  useEffect(() => {
    if (volunteerPositionFromList) {
      if (descriptionValue !== volunteerPositionFromList.description) {
        setSaveEnabled(true);
      }
    }
  }, [descriptionValue, volunteerPositionFromList]);

  const { authUser } = useAuth();
  const navigate = useNavigate();

  const [publish, setPublish] = useState(
    volunteerPositionFromList && volunteerPositionFromList.published
      ? true
      : false
  );

  const [publishEnabled, setPublishEnabled] = useState(
    volunteerPositionFromList ? true : false
  );

  const [selectedPosition, setSelectedPosition] = useState(
    volunteerPositionFromList ? volunteerPositionFromList : null
  );

  const [volunteerForm, setVolunteerForm] = useState({
    position: {
      elementType: "input",
      elementConfig: {
        type: "text",
        placeholder: "Position",
      },
      value: selectedPosition ? selectedPosition.position : "",
      validation: {
        required: true,
      },
      width: "70%",
    },
    image: {
      elementType: "image",
      elementConfig: {
        placeholder: "Image",
        url: selectedPosition ? selectedPosition.Image.url : "",
        file: "",
      },
      value: "",
      validation: {
        required: false,
      },
    },
    frequency: {
      elementType: "select",
      elementConfig: {
        option: [
          { value: "one-time", displayValue: "One-Time" },
          { value: "ongoing", displayValue: "Ongoing" },
        ],
      },
      value: selectedPosition ? selectedPosition.frequency : "one-time",
      validation: { required: true },
    },
    description: {
      elementType: "richtext",
    },
    primaryContact: {
      elementType: "input",
      elementConfig: {
        type: "text",
        placeholder: "Primary contact",
      },
      value: selectedPosition ? selectedPosition.primaryContact : "",
      validation: {
        required: true,
      },
      width: "70%",
    },
    primaryContactEmail: {
      elementType: "input",
      elementConfig: {
        elementType: "email",
        placeholder: "Primary contact email",
      },
      value: selectedPosition ? selectedPosition.primaryContactEmail : "",
      validation: {
        required: true,
      },
      width: "70%",
    },
    sponsoringMinistry: {
      elementType: "input",
      elementConfig: {
        type: "text",
        placeholder: "Sponsoring ministry",
      },
      value: selectedPosition ? selectedPosition.sponsoringMinistry : "",
      validation: {
        required: true,
      },
      width: "70%",
    },
  });

  const inputChangedHandler = (e, inputIdentifier) => {
    setSaveEnabled(true);
    const updatedVolunteerForm = {
      ...volunteerForm,
    };
    const updatedFormElement = {
      ...updatedVolunteerForm[inputIdentifier],
    };

    if (updatedFormElement.elementType === "image") {
      updatedFormElement.elementConfig.url = URL.createObjectURL(
        e.target.files[0]
      );
      updatedFormElement.elementConfig.file = e.target.files[0];
    } else if (updatedFormElement.elementType === "richtext") {
      updatedFormElement.value = e.target;
    } else {
      updatedFormElement.value = e.target.value;
    }

    updatedFormElement.touched = true;
    updatedVolunteerForm[inputIdentifier] = updatedFormElement;

    setVolunteerForm(updatedVolunteerForm);
    // console.log("FORM: ", eventForm);
  };

  const backClickHandler = () => {
    setSelectedRows(null);
    clearSelectedPosition(null);
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    const publishResponse = await server.put("/volunteer/publish", {
      positionId: selectedPosition.id,
      published: !publish,
      orgId: authUser.orgId,
    });
    console.log("RES: ", publishResponse);

    if (positions) {
      const revisedPositions = positions.map((position) => {
        return position.id === selectedPosition.id
          ? { ...selectedPosition, published: !publish }
          : position;
      });
      setPositions(revisedPositions);
    }

    setPublish(!publish);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let volunteerFormValues = new FormData();

    volunteerFormValues.append("position", volunteerForm.position.value);
    volunteerFormValues.append("image", volunteerForm.image.elementConfig.file);
    volunteerFormValues.append("frequency", volunteerForm.frequency.value);
    volunteerFormValues.append("description", descriptionValue);
    volunteerFormValues.append(
      "primaryContact",
      volunteerForm.primaryContact.value
    );
    volunteerFormValues.append(
      "primaryContactEmail",
      volunteerForm.primaryContactEmail.value
    );
    volunteerFormValues.append(
      "sponsoringMinistry",
      volunteerForm.sponsoringMinistry.value
    );
    volunteerFormValues.append("userId", authUser.id);
    volunteerFormValues.append("orgId", authUser.orgId);
    volunteerFormValues.append("published", publish);

    let volunteerResponse;

    if (selectedPosition) {
      volunteerFormValues.append("id", selectedPosition.id);
      volunteerResponse = await server.put("/volunteer", volunteerFormValues);
    } else {
      volunteerResponse = await server.post("/volunteer", volunteerFormValues, {
        headers: {
          "content-type": "multipart/form-data",
        },
      });
    }

    const res = volunteerResponse;

    if (res.status === 200) {
      setPublishEnabled(true);
      setSelectedPosition(res.data);

      if (selectedPosition) {
        const revisedPositions = positions.map((position) => {
          return position.id === selectedPosition.id
            ? { ...res.data }
            : position;
        });

        setPositions(revisedPositions);
      }
    }
  };

  const formElementsArray = [];
  for (let key in volunteerForm) {
    formElementsArray.push({
      id: key,
      config: volunteerForm[key],
    });
  }

  const form = (
    <form encType="multipart/form-data">
      {formElementsArray.map((formElement) => {
        if (formElement.config.elementType === "richtext") {
          return (
            <ReactQuill
              theme="snow"
              value={descriptionValue}
              onChange={setDescriptionValue}
              key={formElement.id}
              className={classes.Quill}
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

  return (
    <div className={classes.PositionSubmission}>
      {selectedPosition ? (
        <Button
          clicked={positions ? backClickHandler : () => navigate("/volunteer")}
        >
          &larr; Back
        </Button>
      ) : null}
      <div className={classes.PositionSubmission__TopInfo}>
        <h2>
          {selectedPosition ? `Edit a` : `Create a new`} Volunteer position
        </h2>
        <div className={classes.PositionSubmission__TopInfo__Buttons}>
          <Button
            disabled={publishEnabled ? false : true}
            clicked={handlePublish}
          >
            {publish ? `Unpublish` : `Publish`}
          </Button>
          <Button disabled={saveEnabled ? false : true} clicked={handleSubmit}>
            Save
          </Button>
        </div>
        <br />
        <br />
      </div>
      {form}
    </div>
  );
};

export default VolunteerCreate;
