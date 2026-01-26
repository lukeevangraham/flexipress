import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Input from "../../../UI/Input/Input";
import Button from "../../../UI/Button/Button";
import server, { getMinistries } from "../../../../apis/server";
import ReactQuill from "react-quill-new";
// import { useLocation } from "react-router-dom";

import classes from "./Create.module.scss";
// import event from "../../../../../../models/event";

const CreateEvent = ({
  eventFromList,
  clearSelectedEvent,
  events,
  setEvents,
  setSelectedRows,
}) => {
  const { authUser } = useAuth();

  const navigate = useNavigate();

  const [publish, setPublish] = useState(
    eventFromList && eventFromList.published ? true : false,
  );
  const [publishEnabled, setPublishEnabled] = useState(
    eventFromList ? true : false,
  );
  const [saveEnabled, setSaveEnabled] = useState(null);
  // const [selectedEvent2, setSelectedEvent2] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(
    eventFromList ? eventFromList : null,
  );

  const [descriptionValue, setDescriptionValue] = useState(
    eventFromList ? eventFromList.description : "",
  );

  // const selectOptions = [
  //   { value: "Youth", displayValue: "Youth" },
  //   { value: "children", displayValue: "Children" },
  //   { value: "worship", displayValue: "Worship" },
  //   { value: "outreach", displayValue: "Outreach" },
  //   { value: "missions", displayValue: "Missions" },
  //   { value: "other", displayValue: "Other" },
  // ];

  const [eventForm, setEventForm] = useState({
    name: {
      elementType: "input",
      elementConfig: {
        type: "text",
        placeholder: "Event name",
      },
      value: selectedEvent ? selectedEvent.name : "",
      validation: {
        required: true,
      },
      width: "70%",
    },
    startDate: {
      elementType: "date",
      elementConfig: {
        timeInputLabel: "Time:",
        dateFormat: "MM/dd/yyyy h:mm aa",
        showTimeInput: true,
        placeholder: "Start date & time",
      },
      value: selectedEvent ? new Date(selectedEvent.startDate) : new Date(),
      validation: {
        required: true,
      },
    },
    endDate: {
      elementType: "date",
      elementConfig: {
        timeInputLabel: "Time:",
        dateFormat: "MM/dd/yyyy h:mm aa",
        showTimeInput: true,
        placeholder: "End date & time",
      },
      value: selectedEvent ? new Date(selectedEvent.endDate) : new Date(),
      validation: {
        required: true,
      },
    },
    repeatsEveryXDays: {
      elementType: "input",
      elementConfig: {
        type: "number",
        placeholder: "Repeats every X days",
        min: 0,
      },
      value:
        selectedEvent && selectedEvent.repeatsEveryXDays
          ? selectedEvent.repeatsEveryXDays
          : "",
      validation: {
        required: false,
      },
      width: "19rem",
    },
    location: {
      elementType: "input",
      elementConfig: {
        type: "text",
        placeholder: "Location",
      },
      value: selectedEvent ? selectedEvent.location : "",
      validation: {
        required: true,
      },
      width: "35rem",
    },
    description: {
      elementType: "richtext",
    },
    image: {
      elementType: "image",
      elementConfig: {
        placeholder: "Image",
        url: selectedEvent?.Image?.url || "",
        file: "",
      },
      value: "",
      validation: {
        required: false,
      },
    },
    embedCode: {
      elementType: "textarea",
      elementConfig: {
        minRows: 8,
        placeholder: "Embed Code (optional)",
      },
      value: selectedEvent ? selectedEvent.embedCode : "",
      validation: {
        required: false,
      },
      // width: "50rem"
    },
    ministries: {
      elementType: "select",
      elementConfig: {
        options: [],
        multiple: true,
        // ministriesList.map()
        placeholder: "Ministries",
      },
      value: selectedEvent?.Ministries
        ? selectedEvent.Ministries.map((m) => m.id.toString())
        : [],
      validation: {
        required: false,
      },
      // width: "20rem",
    },
  });

  useEffect(() => {
    getMinistries(authUser, setEventForm);
  }, [authUser, setEventForm, getMinistries]);

  const handlePublish = async (e) => {
    e.preventDefault();
    // console.log("publish clicked", !publish);
    const publishResponse = await server.put("/event/publish", {
      eventId: selectedEvent.id,
      published: !publish,
      orgId: authUser.orgId,
    });

    if (events) {
      const revisedEvents = events.map((event) => {
        return event.id === selectedEvent.id
          ? { ...selectedEvent, published: !publish }
          : event;
      });
      setEvents(revisedEvents);
    }

    setPublish(!publish);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // console.log("Publish: ", publish);

    let eventFormValues = new FormData();

    eventFormValues.append("name", eventForm.name.value);
    eventFormValues.append("startDate", eventForm.startDate.value);
    eventFormValues.append("endDate", eventForm.endDate.value);
    eventFormValues.append(
      "repeatsEveryXDays",
      eventForm.repeatsEveryXDays.value,
    );
    eventFormValues.append("location", eventForm.location.value);
    eventFormValues.append("description", descriptionValue);
    eventFormValues.append("image", eventForm.image.elementConfig.file);
    eventFormValues.append("userId", authUser.id);
    eventFormValues.append("orgId", authUser.orgId);
    eventFormValues.append("published", publish);
    eventFormValues.append("ministryId", eventForm.ministries.value);
    eventFormValues.append("embedCode", eventForm.embedCode.value);

    // for (var pair of eventFormValues.entries()) {
    //   console.log(pair[0] + ": " + pair[1]);
    // }

    let eventResponse;

    if (selectedEvent) {
      eventFormValues.append("id", selectedEvent.id);
      eventResponse = await server.put("/event", eventFormValues);
    } else {
      eventResponse = await server.post("/event", eventFormValues, {
        headers: {
          "content-type": "multipart/form-data",
        },
      });
    }

    const res = eventResponse;

    if (res.status === 200) {
      setPublishEnabled(true);

      // If the server returns the full list, find the one we just edited
      const justUpdated = res.data.find(
        (ev) =>
          ev.id === (selectedEvent?.id || res.data[res.data.length - 1].id),
      );

      setSelectedEvent(justUpdated);
      setEvents(res.data); // Update the full list
      setSaveEnabled(false);
    }
  };

  const inputChangedHandler = (e, inputIdentifier) => {
    setSaveEnabled(true);
    const updatedEventForm = {
      ...eventForm,
    };
    const updatedFormElement = {
      ...updatedEventForm[inputIdentifier],
    };

    if (updatedFormElement.elementType === "date") {
      updatedFormElement.value = e;
    } else if (updatedFormElement.elementType === "image") {
      updatedFormElement.elementConfig.url = URL.createObjectURL(
        e.target.files[0],
      );
      updatedFormElement.elementConfig.file = e.target.files[0];
    } else if (updatedFormElement.elementType === "richtext") {
      updatedFormElement.value = e.target;
    } else if (updatedFormElement.elementType === "select") {
      const selectedOptions = Array.from(e.target.selectedOptions).map(
        (option) => option.value,
      );
      updatedFormElement.value = selectedOptions;
    } else {
      updatedFormElement.value = e.target.value;
    }

    updatedFormElement.touched = true;
    updatedEventForm[inputIdentifier] = updatedFormElement;
    setEventForm(updatedEventForm);
  };

  const backClickHandler = () => {
    setSelectedRows(null);
    clearSelectedEvent(null);
  };

  const formElementsArray = [];
  for (let key in eventForm) {
    formElementsArray.push({
      id: key,
      config: eventForm[key],
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
  return (
    <div className={classes.EventSubmission}>
      {/* <h1>Events</h1> */}
      {selectedEvent ? (
        <Button clicked={events ? backClickHandler : () => navigate("/events")}>
          &larr; Back
        </Button>
      ) : null}

      <div className={classes.EventSubmission__TopInfo}>
        <h2>{selectedEvent ? `Edit an` : `Create a new`} event</h2>
        <div className={classes.EventSubmission__TopInfo__Buttons}>
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
      </div>
      {/* {console.log("FORM: ", eventForm)} */}
      {form}
    </div>
  );
};

export default CreateEvent;
