import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import ServiceInstanceStore from "../../stores/service_instance_store";
import RouteStore from "../../stores/route_store";
import DomainStore from "../../stores/domain_store";
import AppActivity from "./app_activity";

const itemPropType = PropTypes.shape({
  guid: PropTypes.string.isRequired
});

const propTypes = {
  date: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(itemPropType)
};

const defaultProps = {
  items: []
};

const Header = styled.div`
  padding: 0.25rem 0 0.25rem 1rem;
  font-size: 0.8125rem;
  background-color: #f5f5f3;
`;

const List = styled.ul`
  list-style-type: none;
  margin-top: 0;
  margin-bottom: 0;
  padding-left: 0;
`;

const DailyBucket = ({ date, items }) => [
  <Header key="header">{date}</Header>,
  <List key="list">
    {items.map(item => {
      const { guid, metadata } = item;

      // TODO hydrate elsewhere.
      let service;
      if (metadata.request && metadata.service_instance_guid) {
        service = ServiceInstanceStore.get(
          metadata.request.service_instance_guid
        );
      }

      // TODO hydrate elsewhere.
      const route = RouteStore.get(metadata.route_guid);

      // TODO hydrate elsewhere.
      let domain;
      if (route) {
        domain = DomainStore.get(route.domain_guid);
      }

      return (
        <AppActivity
          key={guid}
          item={item}
          service={service}
          route={route}
          domain={domain}
        />
      );
    })}
  </List>
];

DailyBucket.propTypes = propTypes;

DailyBucket.defaultProps = defaultProps;

export default DailyBucket;
