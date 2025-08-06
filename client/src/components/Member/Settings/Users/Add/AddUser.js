import { useState } from "react";
import server from "../../../../../apis/server";
import { useAuth } from "../../../../../contexts/AuthContext";
import Input from "../../../../UI/Input/Input";
import Button from "../../../../UI/Button/Button";

const AddUser = () => {
  const { authUser } = useAuth();

  const [newUserForm, setNewUserForm] = useState({
    firstName: {
      elementType: "input",
      elementConfig: {
        type: "text",
        placeholder: "First name",
      },
      value: "",
      validation: {
        required: true,
      },
      width: "45%",
    },
    lastName: {
      elementType: "input",
      elementConfig: {
        type: "text",
        placeholder: "Last name",
      },
      value: "",
      validation: {
        required: true,
      },
      width: "45%",
    },
    email: {
      elementType: "input",
      elementConfig: {
        type: "text",
        placeholder: "Email address",
      },
      value: "",
      validation: {
        required: true,
      },
      width: "100%",
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newUserFormValues = {
      firstName: newUserForm.firstName.value,
      lastName: newUserForm.lastName.value,
      email: newUserForm.email.value,
      orgName: authUser.orgName,
      orgId: authUser.orgId,
    };

    const addUserResponse = await server.post("/invite", newUserFormValues);
    console.log("Add User Response: ", addUserResponse);
  };

  const formElementsArray = [];
  for (let key in newUserForm) {
    formElementsArray.push({
      id: key,
      config: newUserForm[key],
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
          changed={(event) => {
            const updatedForm = { ...newUserForm };
            updatedForm[formElement.id].value = event.target.value;
            updatedForm[formElement.id].touched = true;
            setNewUserForm(updatedForm);
          }}
        />
      ))}
      <Button type="submit">
        <>Add User</>
      </Button>
    </form>
  );
  return (
    <div>
      <h1>Add User</h1>
      {form}
    </div>
  );
};

export default AddUser;
