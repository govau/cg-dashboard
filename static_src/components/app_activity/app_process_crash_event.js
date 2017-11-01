import React from "react";
import PropTypes from "prop-types";

const propTypes = { exitDescription: PropTypes.string };

const AppProcessCrashEvent = ({ exitDescription }) => [
  `The process crashed`,
  exitDescription ? [" ", <code key="desc">{exitDescription}</code>] : null
];

AppProcessCrashEvent.propTypes = propTypes;

export default AppProcessCrashEvent;
