import React from "react";
import PropTypes from "prop-types";

import GlobalError from "./global_error";

const propTypes = {
  errors: PropTypes.array.isRequired,
  maxItems: PropTypes.number
};

const defaultProps = {
  maxItems: 1
};

const GlobalErrorContainer = ({ errors, maxItems }) => (
  <div data-test="global-errors">
    {errors
      .slice(0, maxItems)
      .map((err, i) => <GlobalError key={i} err={err} />)}
  </div>
);

GlobalErrorContainer.propTypes = propTypes;

GlobalErrorContainer.defaultProps = defaultProps;

export default GlobalErrorContainer;
