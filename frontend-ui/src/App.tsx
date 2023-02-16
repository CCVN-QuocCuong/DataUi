import { BrowserRouter as Router } from "react-router-dom";
import Routes from './routes'
import store from './store'
import { Provider } from 'react-redux'
import { history } from 'helpers/common';

import "bootstrap/dist/css/bootstrap.min.css";
import "eyzy-tree/style.css";
import "./App.css";
import "./assets/css/app.css";

import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import "react-datepicker/dist/react-datepicker.css";

const App = () => {
  return (
    <Provider store={store}>
      <Router
        history={history}
        getUserConfirmation={(message, callback) => {
          confirmAlert({
            title: "Alert",
            message,
            buttons: [
              {
                label: "Yes",
                onClick: () => callback(true)
              },
              {
                label: "No",
                onClick: () => callback(false)
              }
            ]
          });
        }}>
        <Routes />
      </Router>
    </Provider>
  )
}

export default App;
