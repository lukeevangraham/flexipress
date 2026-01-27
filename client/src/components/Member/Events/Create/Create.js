import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Input from "../../../UI/Input/Input";
import Button from "../../../UI/Button/Button";
import server, { getMinistries } from "../../../../apis/server";
import ReactQuill from "react-quill-new";

import classes from "./Create.module.scss";

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
  const [selectedEvent, setSelectedEvent] = useState(
    eventFromList ? eventFromList : null,
  );

  const [descriptionValue, setDescriptionValue] = useState(
    eventFromList ? eventFromList.description : "",
  );

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
        // FIX 1: Safely access Image url
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
    },
    ministries: {
      elementType: "select",
      elementConfig: {
        options: [],
        multiple: true,
        placeholder: "Ministries",
      },
      // FIX 2: Safely access Ministries array
      value: selectedEvent?.Ministries
        ? selectedEvent.Ministries.map((m) => m.id.toString())
        : [],
      validation: {
        required: false,
      },
    },
  });

  useEffect(() => {
    getMinistries(authUser, setEventForm);
  }, [authUser, setEventForm]);

  const handlePublish = async (e) => {
    e.preventDefault();

    try {
      // 1. Capture the response from the server
      const response = await server.put("/event/publish", {
        eventId: selectedEvent.id,
        published: !publish,
        orgId: authUser.orgId,
      });

      // 2. Use the fresh data from the server (response.data)
      const updatedEvent = response.data;

      // 3. Update the individual state
      setSelectedEvent(updatedEvent);
      setPublish(updatedEvent.published);

      // 4. Update the parent list (grid) state
      if (events) {
        const revisedEvents = events.map((event) => {
          return event.id === updatedEvent.id ? updatedEvent : event;
        });
        setEvents(revisedEvents);
      }
    } catch (err) {
      console.error("Failed to toggle publish status:", err);
      // Optional: Add user-facing error notification here
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let eventFormValues = new FormData();
    eventFormValues.append("name", eventForm.name.value);
    eventFormValues.append("startDate", eventForm.startDate.value);
    eventFormValues.append("endDate", eventForm.endDate.value);

    // SANITIZE: Ensure numbers are actually numbers or null, not "undefined"
    const repeats = eventForm.repeatsEveryXDays.value;
    eventFormValues.append(
      "repeatsEveryXDays",
      repeats === "" || repeats === undefined ? 0 : repeats,
    );

    eventFormValues.append("location", eventForm.location.value);
    eventFormValues.append("description", descriptionValue);
    eventFormValues.append("image", eventForm.image.elementConfig.file);
    eventFormValues.append("userId", authUser.id);
    eventFormValues.append("orgId", authUser.orgId);
    eventFormValues.append("published", publish);
    eventFormValues.append("ministryId", eventForm.ministries.value);

    // SANITIZE: Prevent the literal string "undefined" from being saved
    eventFormValues.append("embedCode", eventForm.embedCode.value || "");

    let eventResponse;

    // CRITICAL CHECK: Ensure we have a REAL numeric ID before attempting a PUT
    const hasValidId =
      selectedEvent && selectedEvent.id && selectedEvent.id !== "undefined";

    if (hasValidId) {
      eventFormValues.append("id", selectedEvent.id);
      eventResponse = await server.put("/event", eventFormValues);
    } else {
      eventResponse = await server.post("/event", eventFormValues, {
        headers: { "content-type": "multipart/form-data" },
      });
    }

    const res = eventResponse;

    // Check if status is 200 AND ensure res.data is actually an array
    if (res.status === 200 && Array.isArray(res.data)) {
      setPublishEnabled(true);

      // Find the event we just created or updated
      const justUpdated = res.data.find(
        (ev) =>
          ev.id === (selectedEvent?.id || res.data[res.data.length - 1].id),
      );

      if (justUpdated) {
        setSelectedEvent(justUpdated);
        setPublish(justUpdated.published);
        setEvents(res.data);
        setSaveEnabled(false);
      }
    } else {
      // Handle the case where the server returned an error object instead of the list
      console.error(
        "Server did not return an array. Check backend logs.",
        res.data,
      );
      alert("Save failed: " + (res.data.error || "Unknown server error"));
    }
  };

  const inputChangedHandler = (e, inputIdentifier) => {
    setSaveEnabled(true);
    const updatedEventForm = { ...eventForm };
    const updatedFormElement = { ...updatedEventForm[inputIdentifier] };

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
    formElementsArray.push({ id: key, config: eventForm[key] });
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
      {(selectedEvent || clearSelectedEvent) && (
        <Button
          clicked={
            clearSelectedEvent ? backClickHandler : () => navigate("/events")
          }
        >
          &larr; Back
        </Button>
      )}

      <div className={classes.EventSubmission__TopInfo}>
        <h2>{selectedEvent ? `Edit an` : `Create a new`} event</h2>
        <div className={classes.EventSubmission__TopInfo__Buttons}>
          <Button disabled={!publishEnabled} clicked={handlePublish}>
            {publish ? `Unpublish` : `Publish`}
          </Button>
          <Button disabled={!saveEnabled} clicked={handleSubmit}>
            Save
          </Button>
        </div>
      </div>
      {form}
    </div>
  );
};

export default CreateEvent;
