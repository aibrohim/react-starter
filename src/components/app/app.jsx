import React from "react";
import {Router as BrowserRouter, Switch, Route} from "react-router-dom";
import browserHistory from "../../browser-history.js";

import Main from "../main/main";

const App = () => {
  return (
    <BrowserRouter history={browserHistory}>
      <Switch>
        <Route exact path="/" render={() => <Main />} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
