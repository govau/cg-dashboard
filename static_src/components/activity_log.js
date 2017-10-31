import React from "react";
import PropTypes from "prop-types";

import Action from "./action";
import AppActivity from "./app_activity/app_activity";
import ActivityStore from "../stores/activity_store";
import AppStore from "../stores/app_store";
import DomainStore from "../stores/domain_store";
import ErrorMessage from "./error_message";
import PanelActions from "./panel_actions";
import RouteStore from "../stores/route_store";
import ServiceInstanceStore from "../stores/service_instance_store";

const mapStoreToState = () => {
  const appGuid = AppStore.currentAppGuid;
  const activity = ActivityStore.getAll()
    .filter(item => {
      if (item.activity_type === "log") {
        return item.app_guid === appGuid && item.status_code >= 400;
      }

      if (
        item.activity_type === "event" &&
        item.type === "audit.service_binding.create"
      ) {
        return item.metadata.request.app_guid === appGuid;
      }

      if (item.activity_type === "event") {
        return item.actee === appGuid;
      }

      return false;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return {
    activity,
    empty: ActivityStore.fetched && activity.length === 0,
    hasFetchLogsError: ActivityStore.hasFetchLogsError
  };
};

const propTypes = { itemsPerPage: PropTypes.number };

const defaultProps = { itemsPerPage: 10 };

export default class ActivityLog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ...mapStoreToState(),
      maxItems: props.itemsPerPage
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleLoadMore = this.handleLoadMore.bind(this);
  }

  componentDidMount() {
    ActivityStore.addChangeListener(this.handleChange);
    DomainStore.addChangeListener(this.handleChange);
    RouteStore.addChangeListener(this.handleChange);
    ServiceInstanceStore.addChangeListener(this.handleChange);
  }

  componentWillUnmount() {
    ActivityStore.removeChangeListener(this.handleChange);
    DomainStore.removeChangeListener(this.handleChange);
    RouteStore.removeChangeListener(this.handleChange);
    ServiceInstanceStore.removeChangeListener(this.handleChange);
  }

  handleChange() {
    this.setState(() => mapStoreToState());
  }

  handleLoadMore(e) {
    e.preventDefault();

    this.setState(({ maxItems }) => ({
      ...mapStoreToState(),
      maxItems: maxItems + this.props.itemsPerPage
    }));
  }

  showMoreButton() {
    const { activity, maxItems } = this.state;

    return activity.length >= maxItems;
  }

  render() {
    const { empty, hasFetchLogsError, maxItems, activity } = this.state;

    if (empty) {
      return <h5>No recent activity</h5>;
    }

    return (
      <div>
        {hasFetchLogsError && (
          <ErrorMessage
            error={{
              message:
                "Could not load recent logs. Recent events may still be shown below."
            }}
          />
        )}
        <ul className="activity_log">
          {activity.slice(0, maxItems).map(item => {
            const { guid, metadata } = item;

            let service;
            if (metadata.request && metadata.service_instance_guid) {
              service = ServiceInstanceStore.get(
                metadata.request.service_instance_guid
              );
            }

            const route = RouteStore.get(metadata.route_guid);

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
          {this.showMoreButton() && (
            <PanelActions>
              <Action
                label="View more"
                clickHandler={this.handleLoadMore}
                type="outline"
              >
                Show more activity
              </Action>
            </PanelActions>
          )}
        </ul>
      </div>
    );
  }
}

ActivityLog.propTypes = propTypes;
ActivityLog.defaultProps = defaultProps;
