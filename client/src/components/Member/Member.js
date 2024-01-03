import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../UI/Button/Button";

const Member = () => {
  const { setIsLoggedIn, setAuthUser, authUser } = useAuth();

  const signOut = async (e) => {
    e.preventDefault();
    console.log("sign out");

    axios.get("http://localhost:3000/api/logout").then((res) => {
      setIsLoggedIn(false);
      setAuthUser(null);
    });
  };

  return (
    <>
      <div>Member</div>

      <div>
        Hello {authUser.email} of {authUser.orgName}
      </div>

      <button onClick={(e) => signOut(e)}>Sign Out</button>

      {/* <Button onClick={(e) => console.log("HI")} type="submit" color={"green"}>
        <>Sign Out</>
      </Button> */}
    </>
  );
};

export default Member;
