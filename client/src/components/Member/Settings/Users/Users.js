import { useEffect, useState } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { Link } from "react-router-dom";
import server from "../../../../apis/server";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme

import classes from "./Users.module.scss";

const Users = () => {
  const { authUser } = useAuth();

  const [userList, setUserList] = useState([]);
  const [colDefs, setColDefs] = useState([]);

  useEffect(() => {
    const getUsers = async () => {
      // GUARD: Only fetch if we actually have an orgId
      if (!authUser || !authUser.orgId) return;

      try {
        const usersRes = await server.get(`/org_users?orgId=${authUser.orgId}`);
        setUserList(usersRes.data || []); // Fallback to empty array
        setColDefs([
          { field: "email", headerName: "Email", flex: 1 },
          { field: "firstName", headerName: "First Name", flex: 1 },
          { field: "lastName", headerName: "Last Name", flex: 1 },
          { field: "role", headerName: "Role", flex: 1 },
        ]);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    getUsers();
  }, [authUser]);

  console.log("userList: ", userList);

  return (
    <div className={classes.Users}>
      <h1>Users</h1>
      {console.log("authUser: ", authUser)}
      <div>
        <Link to="/settings/users/add">
          Add a new user to {authUser.orgName}'s Flexipress
        </Link>
      </div>
      <br />
      <br />
      <h2>Users in {authUser.orgName}</h2>
      <div className="ag-theme-quartz" style={{ height: 400 }}>
        <AgGridReact
          rowData={userList}
          columnDefs={colDefs}
          domLayout="autoHeight"
        />
      </div>
    </div>
  );
};

export default Users;
