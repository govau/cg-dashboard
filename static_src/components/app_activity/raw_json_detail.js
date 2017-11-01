import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const propTypes = {
  item: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired
};

const Wrapper = styled.div`
  margin-left: 1rem;
  margin-bottom: 1rem;
  overflow: scroll;
`;

const RawJSONDetail = ({ item, visible }) => {
  if (!visible) {
    return null;
  }

  return (
    <Wrapper>
      <code>
        <pre>{JSON.stringify(item, null, 2)}</pre>
      </code>
    </Wrapper>
  );
};

RawJSONDetail.propTypes = propTypes;

export default RawJSONDetail;
