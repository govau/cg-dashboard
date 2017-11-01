import PropTypes from "prop-types";
import moment from "moment-timezone";

const propTypes = {
  timestamp: PropTypes.string.isRequired
};

const formatTimestamp = timestamp =>
  moment(timestamp)
    .tz(moment.tz.guess())
    .format("HH:mm:ss");

const Timestamp = ({ timestamp }) => formatTimestamp(timestamp);

Timestamp.propTypes = propTypes;

export default Timestamp;
