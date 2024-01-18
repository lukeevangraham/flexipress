import { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Input from "../../../UI/Input/Input";
import Button from "../../../UI/Button/Button";
import server from "../../../../apis/server";
import { useLocation } from "react-router-dom";

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
    eventFromList && eventFromList.published ? true : false
  );
  const [publishEnabled, setPublishEnabled] = useState(
    eventFromList ? true : false
  );
  const [saveEnabled, setSaveEnabled] = useState(null);
  // const [selectedEvent2, setSelectedEvent2] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(
    eventFromList ? eventFromList : null
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
      groupStyle: { gridColumn: "1 / 7" },
    },
    // startDate: {
    //   elementType: "date",
    //   elementConfig: {
    //     timeInputLabel: "Time:",
    //     dateFormat: "MM/dd/yyyy h:mm aa",
    //     showTimeInput: true,
    //     placeholder: "Start date & time",
    //   },
    //   value: selectedEvent ? new Date(selectedEvent.startDate) : new Date(),
    //   validation: {
    //     required: true,
    //   },
    // },
    startMonth: {
      elementType: "select",
      elementConfig: {
        type: "month",
        placeholder: "Start date",
        options: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ],
      },
      value: selectedEvent ? selectedEvent : "",
      validation: { required: true },
      groupStyle: { gridColumnStart: 1 },
    },
    startDay: {
      elementType: "input",
      elementConfig: {
        type: "number",
        placeholder: "",
        min: 1,
        max: 31,
      },
      value: selectedEvent ? selectedEvent : "01",
      validation: { required: true },
      groupStyle: { gridColumn: "2 / span 2" },
    },
    startYear: {
      elementType: "input",
      elementConfig: {
        type: "number",
        placeholder: "",
        min: new Date().toLocaleDateString("en-US", { year: "numeric" }),
      },
      value: selectedEvent
        ? selectedEvent
        : new Date().toLocaleDateString("en-US", { year: "numeric" }),
      validation: { required: true },
      groupStyle: { gridColumn: "4 / span 3" },
    },
    startHour: {
      elementType: "input",
      elementConfig: {
        type: "number",
        placeholder: "Start time",
        min: 1,
        max: 12,
      },
      value: selectedEvent ? selectedEvent : "12",
      validation: { required: true },
      groupStyle: { gridColumn: "7 / span 2" },
    },
    startMin: {
      elementType: "input",
      elementConfig: {
        type: "number",
        placeholder: "",
        min: 0,
        max: 59,
      },
      value: selectedEvent ? selectedEvent : "00",
      validation: { required: true },
      groupStyle: { gridColumn: "9 / span 2" },
    },
    startAmPm: {
      elementType: "select",
      elementConfig: {
        type: "amPm",
        placeholder: "",
        options: ["am", "pm"],
      },
      value: selectedEvent ? selectedEvent : "am",
      validation: { required: true },
      groupStyle: { gridColumn: "11 / span 2" }
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
      groupStyle: { gridColumnStart: 1 },
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
      groupStyle: { gridColumn: "1 / 4" },
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
      groupStyle: { gridColumnStart: 1 },
    },
    description: {
      elementType: "textarea",
      elementConfig: {
        minRows: 8,
        placeholder: "Description",
      },
      value: selectedEvent ? selectedEvent.description : "",
      validation: {
        required: true,
      },
      groupStyle: { gridColumn: "1 / 13" },
    },
    image: {
      elementType: "image",
      elementConfig: {
        placeholder: "Image",
        url: selectedEvent ? selectedEvent.Image.url : "",
        file: "",
      },
      value: "",
      validation: {
        required: false,
      },
      groupStyle: { gridColumnStart: 1 },
    },
  });

  const [error, setError] = useState("");

  const handlePublish = async (e) => {
    e.preventDefault();
    // console.log("publish clicked", !publish);
    const publishResponse = await server.put("/event/publish", {
      eventId: selectedEvent.id,
      published: !publish,
      orgId: authUser.orgId,
    });
    console.log("RES: ", publishResponse);

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

    console.log("Publish: ", publish);

    // console.log("Form: ", eventForm);

    let eventFormValues = new FormData();

    eventFormValues.append("name", eventForm.name.value);
    eventFormValues.append("startDate", eventForm.startDate.value);
    eventFormValues.append("endDate", eventForm.endDate.value);
    eventFormValues.append(
      "repeatsEveryXDays",
      eventForm.repeatsEveryXDays.value
    );
    eventFormValues.append("location", eventForm.location.value);
    eventFormValues.append("description", eventForm.description.value);
    eventFormValues.append("image", eventForm.image.elementConfig.file);
    eventFormValues.append("userId", authUser.id);
    eventFormValues.append("orgId", authUser.orgId);
    eventFormValues.append("published", publish);

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
      setSelectedEvent(res.data);

      if (selectedEvent) {
        const revisedEvents = events.map((event) => {
          return event.id === selectedEvent.id
            ? {
                ...res.data,
              }
            : event;
        });

        setEvents(revisedEvents);
        console.log("RE: ", revisedEvents);
      }
    }

    console.log("event response: ", res);
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
        e.target.files[0]
      );
      updatedFormElement.elementConfig.file = e.target.files[0];
    } else {
      updatedFormElement.value = e.target.value;
    }

    updatedFormElement.touched = true;
    updatedEventForm[inputIdentifier] = updatedFormElement;
    setEventForm(updatedEventForm);
    // console.log("FORM: ", eventForm);
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
      {formElementsArray.map((formElement) => (
        <Input
          key={formElement.id}
          elementType={formElement.config.elementType}
          elementConfig={formElement.config.elementConfig}
          value={formElement.config.value}
          changed={(e) => inputChangedHandler(e, formElement.id)}
          required={formElement.config.validation.required}
          width={formElement.config.width}
          groupStyle={formElement.config.groupStyle}
        />
      ))}
      {error ? <div className={classes.error}>{error}</div> : null}
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
