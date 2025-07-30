import { Link } from "react-router-dom";

const Settings = () => (
  <div>
    <h2>Settings</h2>
    <div>
      <Link to="/settings/users">Users</Link>{" "}
    </div>
    <div>
      <Link to="/settings/roles">Roles</Link>{" "}
    </div>
  </div>
);

export default Settings;
