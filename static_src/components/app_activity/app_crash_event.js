import PropTypes from "prop-types";

const reason = (description, status) => {
  switch (description) {
    case "app instance exited":
      return `the app instance exited with ${status} status`;
    case "out of memory":
      return "it ran out of memory";
    case "failed to accept connections within health check timeout":
    case "failed to start":
      return `it ${description}`;
    default:
      return "of an unknown reason";
  }
};

const propTypes = {
  exitDescription: PropTypes.string,
  exitStatus: PropTypes.string
};

const AppCrashEvent = ({ exitDescription, exitStatus }) =>
  `The app crashed because ${reason(exitDescription, exitStatus)}.`;

AppCrashEvent.propTypes = propTypes;

export default AppCrashEvent;
