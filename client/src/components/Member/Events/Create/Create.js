import { useState } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import Input from "../../../UI/Input/Input";
import Button from "../../../UI/Button/Button";
import server from "../../../../apis/server";

import classes from "./Create.module.scss";
// import event from "../../../../../../models/event";

const CreateEvent = () => {
  const { authUser } = useAuth();

  const [eventForm, setEventForm] = useState({
    name: {
      elementType: "input",
      elementConfig: {
        type: "text",
        placeholder: "Event name",
      },
      value: "",
      validation: {
        required: true,
      },
    },
    startDate: {
      elementType: "date",
      elementConfig: {
        timeInputLabel: "Time:",
        dateFormat: "MM/dd/yyyy h:mm aa",
        showTimeInput: true,
        placeholder: "Start date & time",
      },
      value: new Date(),
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
      value: new Date(),
      validation: {
        required: true,
      },
    },
    repeatsEveryXDays: {
      elementType: "input",
      elementConfig: {
        type: "number",
        placeholder: "Repeats every X days",
      },
      value: "",
      validation: {
        required: false,
      },
    },
    location: {
      elementType: "input",
      elementConfig: {
        type: "text",
        placeholder: "Location",
      },
      value: "",
      validation: {
        required: true,
      },
    },
    description: {
      elementType: "textarea",
      elementConfig: {
        minRows: 5,
        placeholder: "Description",
      },
      value: "",
      validation: {
        required: true,
      },
    },
    image: {
      elementType: "image",
      elementConfig: {
        placeholder: "Image",
      },
      validation: {
        required: false,
      },
    },
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eventFormValues = {
      name: eventForm.name.value,
      startDate: eventForm.startDate.value,
      endDate: eventForm.endDate.value,
      repeatsEveryXDays: eventForm.repeatsEveryXDays.value,
      location: eventForm.location.value,
      description: eventForm.description.value,
      orgId: authUser.orgId,
    };

    const eventResponse = await server.post("/event", eventFormValues);

    console.log("event response: ", eventResponse);
  };

  const inputChangedHandler = (e, inputIdentifier) => {
    const updatedEventForm = {
      ...eventForm,
    };
    const updatedFormElement = {
      ...updatedEventForm[inputIdentifier],
    };

    if (updatedFormElement.elementType === "date") {
      updatedFormElement.value = e;
    } else {
      updatedFormElement.value = e.target.value;
    }

    updatedFormElement.touched = true;
    updatedEventForm[inputIdentifier] = updatedFormElement;
    setEventForm(updatedEventForm);
  };

  const formElementsArray = [];
  for (let key in eventForm) {
    formElementsArray.push({
      id: key,
      config: eventForm[key],
    });
  }

  const form = (
    <form onSubmit={handleSubmit}>
      {formElementsArray.map((formElement) => (
        <Input
          key={formElement.id}
          elementType={formElement.config.elementType}
          elementConfig={formElement.config.elementConfig}
          value={formElement.config.value}
          changed={(e) => inputChangedHandler(e, formElement.id)}
          required={formElement.config.validation.required}
        />
      ))}
      {error ? <div className={classes.error}>{error}</div> : null}
      <Button>
        <>Save</>
      </Button>
    </form>
  );
  return (
    <>
      <h1>Events</h1>
      <h2>Create a new event</h2>
      {form}
    </>
  );
};

export default CreateEvent;
