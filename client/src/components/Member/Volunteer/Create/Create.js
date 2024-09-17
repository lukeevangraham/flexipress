import { useState } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Input from "../../../UI/Input/Input";

const VolunteerCreate = ({ volunteerPositionFromList }) => {
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

  const [saveEnabled, setSaveEnabled] = useState(null);

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
      value: "",
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
    } else {
      updatedFormElement.value = e.target.value;
    }

    updatedFormElement.touched = true;
    updatedVolunteerForm[inputIdentifier] = updatedFormElement;
    setVolunteerForm(updatedVolunteerForm);
    // console.log("FORM: ", eventForm);
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
      {formElementsArray.map((formElement) => (
        <Input
          key={formElement.id}
          elementType={formElement.config.elementType}
          elementConfig={formElement.config.elementConfig}
          value={formElement.config.value}
          changed={(e) => inputChangedHandler(e, formElement.id)}
          required={formElement.config.validation.required}
          width={formElement.config.width}
        />
      ))}
    </form>
  );

  return <div>Volunteer Create{form}</div>;
};

export default VolunteerCreate;
