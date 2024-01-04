import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Button from "../../UI/Button/Button";
import { Link } from "react-router-dom";

import classes from "./Sidebar.module.scss";

const Sidebar = () => {
  const { authUser, setIsLoggedIn, setAuthUser } = useAuth();

  const navigate = useNavigate();

  const signOut = async (e) => {
    e.preventDefault();
    console.log("sign out");

    axios.get("http://localhost:3000/api/logout").then((res) => {
      setIsLoggedIn(false);
      setAuthUser(null);
      navigate("/");
    });
  };

  return (
    <div className={classes.Sidebar}>
      <div className={classes.Sidebar__Org}>{authUser.orgName}</div>
      <div className={classes.Sidebar__Info}>
        <div className={classes.Sidebar__Info__InfoGroup}>
          <div className={classes.Sidebar__Info__InfoGroup__Name}>
            Info Sets
          </div>
          <ul>
            <li>
              <Link to="/events">Events</Link>
            </li>
            <li>
              <Link to="/articles">Articles</Link>
            </li>
            {/* <li>Articles</li> */}
            <li>Job Openings</li>
            <li>Ministries</li>
            <li>Staff Members</li>
            <li>Sermons</li>
          </ul>
        </div>
        <div className={classes.Sidebar__Info__InfoGroup}>
          <div className={classes.Sidebar__Info__InfoGroup__Name}>
            Info Singles
          </div>
          <ul>
            <li>Global</li>
            <li>Home</li>
            <li>About</li>
            <li>Contact</li>
            <li>Giving</li>
            <li>I'm New</li>
            <li>Kids</li>
            <li>Visit</li>
            <li>Prayer</li>
          </ul>
        </div>
      </div>
      <div className={classes.Sidebar__User}>
        <div>{authUser.email}</div>
        <div className={classes.Sidebar__userButton}>
          <Button clicked={signOut}>
            <>Sign Out</>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
