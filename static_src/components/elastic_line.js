import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

const propTypes = {
  children: PropTypes.array,
  className: PropTypes.string
};

const defaultProps = {
  className: ""
};

const ElasticLine = ({ children, className }) => (
  <div className={classNames("elastic_line", className)}>{children}</div>
);

ElasticLine.propTypes = propTypes;

ElasticLine.defaultProps = defaultProps;

export default ElasticLine;
