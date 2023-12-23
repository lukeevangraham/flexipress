import Auth from "./Auth/Auth";

import classes from "./Home.module.scss";

const Home = () => (
  <div className={classes.Home}>
    <div>Welcome</div>
    <Auth />
  </div>
);

export default Home;
