import Auth from "./Auth/Auth";

import classes from "./Home.module.scss";

const Home = () => {
  return (
    <div className={classes.Home}>
      <div>Welcome</div>
      <Auth />
    </div>
  );
};

export default Home;
