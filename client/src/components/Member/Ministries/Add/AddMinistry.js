import { useState } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import Input from "../../../UI/Input/Input";
import Button from "../../../UI/Button/Button";
import server from "../../../../apis/server";

const AddMinistry = () => {
  const { authUser } = useAuth();

  const [messageStatus, setMessageStatus] = useState();

  const [newMinistryForm, setNewMinistryForm] = useState({
    name: {
      elementType: "input",
      elementConfig: {
        type: "text",
        placeholder: "Ministry name",
      },
      value: "",
      validation: {
        required: true,
      },
      width: "100%",
    },
    description: {
      elementType: "textarea",
      elementConfig: {
        placeholder: "Ministry description",
      },
      value: "",
      validation: {
        required: false,
      },
      width: "100%",
    },
    primaryContact: {
      elementType: "input",
      elementConfig: {
        type: "text",
        placeholder: "Primary contact name",
      },
      value: "",
      validation: {
        required: false,
      },
      width: "100%",
    },
    primaryContactEmail: {
      elementType: "input",
      elementConfig: {
        type: "email",
        placeholder: "Primary contact email",
      },
      value: "",
      validation: {
        required: false,
      },
      width: "100%",
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessageStatus(1);

    const newMinistryFormValues = {
      name: newMinistryForm.name.value,
      description: newMinistryForm.description.value,
      primaryContact: newMinistryForm.primaryContact.value,
      primaryContactEmail: newMinistryForm.primaryContactEmail.value,
      orgId: authUser.orgId,
    };

    try {
      const addMinistryResponse = await server.post(
        `/ministries/add/${authUser.orgId}`,
        newMinistryFormValues
      );
      if (addMinistryResponse.status === 200) {
        setMessageStatus(2);
      }
    } catch (error) {
      console.error("Error adding ministry:", error);
      setMessageStatus(3); // Error status
    }
  };

  const formElementsArray = [];
  for (let key in newMinistryForm) {
    formElementsArray.push({
      id: key,
      config: newMinistryForm[key],
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
          width={formElement.config.width}
          changed={(e) => {
            const updatedForm = { ...newMinistryForm };
            updatedForm[formElement.id].value = e.target.value;
            setNewMinistryForm(updatedForm);
          }}
        />
      ))}
      <Button type="submit">
        <>Add Ministry</>
      </Button>
    </form>
  );

  return (
    <div>
      <div>
        <h1>Add Ministry</h1>
        {form}
      </div>
    </div>
  );
};

export default AddMinistry;
