import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import classNames from "classnames";

import arrowRightSrc from "./angle-arrow-right.svg";
import arrowDownSrc from "./angle-arrow-down.svg";
import eventLogTypes from "../../util/event_log_types";
import EL from "../elastic_line";
import ElasticLineItem from "../elastic_line_item";
import Timestamp from "./timestamp";
import LogItem from "./log_item";
import AppCrashEvent from "./app_crash_event";
import AppProcessCrashEvent from "./app_process_crash_event";
import RouteEventItem from "./route_event_item";
import RawJSONDetail from "./raw_json_detail";

const propTypes = {
  domain: PropTypes.object,
  item: PropTypes.object.isRequired,
  route: PropTypes.object,
  service: PropTypes.object
};

const activityTypes = {
  LOG: "log",
  EVENT: "event"
};

const cssClassesForItem = item => {
  const { type, activity_type: activityType } = item;

  switch (activityType) {
    case activityTypes.LOG:
      return ["activity_log-item", "activity_log-item-console"];
    case activityTypes.EVENT:
      return [
        "activity_log-item",
        {
          "activity_log-item-error":
            type === eventLogTypes.APP_CRASH ||
            type === eventLogTypes.APP_PROCESS_CRASH,
          "activity_log-item-warning":
            type === eventLogTypes.APP_UPDATE ||
            type === eventLogTypes.APP_RESTAGE,
          "activity_log-item-success": type === eventLogTypes.APP_CREATE
        }
      ];
    default:
      return ["activity_log-item"];
  }
};

const routeEventItem = (actor, domain, route, unmapped) => {
  const props = { actor, domain, route, unmapped };
  return <RouteEventItem {...props} />;
};

const formatStorageUpdateMessage = (actor, metadata) => {
  if ("memory" in metadata.request) {
    // Updated one of memory, disk_quota, or instances
    return `${actor} modified resource allocation of the app.`;
  }

  const appState = metadata.request.state
    ? metadata.request.state.toLowerCase()
    : "updated";

  return `${actor} ${appState} the app.`;
};

const formatBoundServiceMessage = (actor, service) => {
  const serviceText = service ? service.guid : "a service";
  return `${actor} bound ${serviceText} to the app.`;
};

const Item = styled.div`
  border-top: 1px solid #d3d3d3;
`;

const Line = styled.div`
  font-size: 0.8125rem;
  padding: 0 0 0 1rem;
`;

const ElasticLine = styled(EL)`
  min-height: 2rem;
`;

const renderToggleIcon = ({ expanded }) => (
  <img
    className="right-arrow"
    src={expanded ? arrowDownSrc : arrowRightSrc}
    alt={expanded ? "Collapse" : "Expand"}
  />
);

renderToggleIcon.propTypes = { expanded: PropTypes.bool.isRequired };
renderToggleIcon.defaultProps = { expanded: false };

export default class ActivityLogItem extends Component {
  constructor(props) {
    super(props);

    this.state = { expanded: false };

    this.handleToggleExpanded = this.handleToggleExpanded.bind(this);
  }

  handleToggleExpanded() {
    this.setState(({ expanded }) => ({ expanded: !expanded }));
  }

  renderEventMessage() {
    const { domain, item, route } = this.props;
    const itemType = item.type;
    const { metadata } = item;

    switch (itemType) {
      case eventLogTypes.APP_CRASH: {
        const exitDescription = metadata.exit_description;
        const exitStatus = metadata.exit_status;
        return <AppCrashEvent {...{ exitDescription, exitStatus }} />;
      }
      case eventLogTypes.APP_PROCESS_CRASH: {
        const exitDescription = metadata.exit_description;
        return <AppProcessCrashEvent {...{ exitDescription }} />;
      }
      case eventLogTypes.APP_CREATE:
        return `${item.actor_name} created the app with ${metadata.request
          .memory} MBs of memory.`;
      case eventLogTypes.APP_MAP_ROUTE:
        return routeEventItem(item.actor_name, domain, route);
      case eventLogTypes.APP_UNMAP_ROUTE:
        return routeEventItem(item.actor_name, domain, route, "unmapped");
      case eventLogTypes.APP_RESTAGE:
        return `${item.actor_name} restaged the app.`;
      case eventLogTypes.APP_UPDATE:
        return formatStorageUpdateMessage(item.actor_name, metadata);
      case eventLogTypes.APP_BIND_SERVICE:
        return formatBoundServiceMessage(item.actor_name, this.props.service);
      default:
        return itemType;
    }
  }

  renderItem() {
    const { item } = this.props;

    if (item.activity_type === activityTypes.LOG) {
      return (
        <LogItem
          statusCode={item.status_code}
          requestedUrl={item.requested_url}
        />
      );
    }

    return (
      <span className="activity_log-item_text">
        {this.renderEventMessage()}
      </span>
    );
  }

  render() {
    const { item } = this.props;
    const { expanded } = this.state;

    return (
      <Item
        onClick={this.handleToggleExpanded}
        className={classNames(...cssClassesForItem(item))}
      >
        <Line className="activity_log-item_line">
          <ElasticLine>
            <ElasticLineItem>{renderToggleIcon({ expanded })}</ElasticLineItem>
            <ElasticLineItem>
              <Timestamp timestamp={item.timestamp} />
            </ElasticLineItem>
            <ElasticLineItem>{this.renderItem()}</ElasticLineItem>
          </ElasticLine>
        </Line>
        <RawJSONDetail item={item} visible={expanded} />
      </Item>
    );
  }
}

ActivityLogItem.propTypes = propTypes;
