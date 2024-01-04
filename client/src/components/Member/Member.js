import axios from "axios";
import server from "../../apis/server";
import { useAuth } from "../../contexts/AuthContext";
import Sidebar from "./Sidebar/Sidebar";

const Member = () => {
  const { setIsLoggedIn, setAuthUser, authUser } = useAuth();

  const signOut = async (e) => {
    e.preventDefault();
    console.log("sign out");

    server.get("/logout").then((res) => {
      setIsLoggedIn(false);
      setAuthUser(null);
    });
  };

  return (
    <>
      <div>Member</div>
    </>
  );
};

export default Member;
