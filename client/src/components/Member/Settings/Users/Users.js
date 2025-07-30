import { useAuth } from "../../../../contexts/AuthContext";
import { Link } from "react-router-dom";

const Users = () => {
  const { authUser } = useAuth();

  return (
    <div>
      <h2>Users</h2>
      {console.log("authUser: ", authUser)}
      <div>
        <Link to="/settings/users/add">
          Add a new user to {authUser.orgName}'s Flexipress
        </Link>
      </div>
    </div>
  );
};

export default Users;
