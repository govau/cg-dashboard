import React from "react";
import PropTypes from "prop-types";
import { translate } from "react-i18next";

import Notification from "./notification";
import { config } from "skin";
import errorActions from "../actions/error_actions";

const propTypes = {
  t: PropTypes.func.isRequired,
  err: PropTypes.object
};

const defaultProps = {};

class GlobalError extends React.Component {
  constructor(props) {
    super(props);

    this.handleNotificationDismiss = this.handleNotificationDismiss.bind(this);
    this.handleNotificationRefresh = this.handleNotificationRefresh.bind(this);
  }

  handleNotificationDismiss(e) {
    e.preventDefault();

    errorActions.dismissError(this.props.err);
  }

  handleNotificationRefresh(e) {
    e.preventDefault();

    window.location.reload();
  }

  render() {
    const { t, err } = this.props;
    const link = config.docs.status && (
      <span>
        {" "}
        check{" "}
        <a target="_blank" href={config.docs.status}>
          {config.platform.name}’s status
        </a>{" "}
        or
      </span>
    );

    const description = t(err.description || "An unknown error occurred");
    const wrappedDescription = (
      <span>
        {description}. {description.length > 80 && <br />}
        Please {link} try again.
      </span>
    );

    return (
      <Notification
        message={wrappedDescription}
        actions={[
          { text: "Refresh", clickHandler: this.handleNotificationRefresh }
        ]}
        onDismiss={this.handleNotificationDismiss}
      />
    );
  }
}

GlobalError.propTypes = propTypes;
GlobalError.defaultProps = defaultProps;

export default translate()(GlobalError);
