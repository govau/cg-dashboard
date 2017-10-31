import React from "react";
import PropTypes from "prop-types";

import Action from "./action";
import AppActivity from "./app_activity/app_activity";
import ActivityStore from "../stores/activity_store";
import AppStore from "../stores/app_store";
import DomainStore from "../stores/domain_store";
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
    hasErrors: ActivityStore.hasErrors,
    errors: ActivityStore.errors
  };
};

const propTypes = { maxItems: PropTypes.number };

const defaultProps = { maxItems: 10 };

export default class ActivityLog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ...mapStoreToState(props),
      maxItems: props.maxItems
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
    this.setState(mapStoreToState(this.props));
  }

  handleLoadMore(e) {
    e.preventDefault();

    const currentState = mapStoreToState(this.props);
    currentState.maxItems = this.state.maxItems + this.props.maxItems;
    this.setState(currentState);
  }

  showMoreActivity() {
    const { activity, maxItems } = this.state;
    return activity.length > this.props.maxItems && activity.length >= maxItems;
  }

  render() {
    const { empty, hasErrors } = this.state;

    if (hasErrors) {
      return <h5>An error occurred fetching recent activity</h5>;
    }
    if (empty) {
      return <h5>No recent activity</h5>;
    }

    const showMore = this.showMoreActivity() && (
      <PanelActions>
        <Action
          label="View more"
          clickHandler={this.handleLoadMore}
          type="outline"
        >
          Show more activity
        </Action>
      </PanelActions>
    );

    return (
      <div>
        <ul className="activity_log">
          {this.state.activity.slice(0, this.state.maxItems).map(item => {
            let service;
            if (item.metadata.request && item.metadata.service_instance_guid) {
              service = ServiceInstanceStore.get(
                item.metadata.request.service_instance_guid
              );
            }

            let domain;
            const route = RouteStore.get(item.metadata.route_guid);
            if (route) {
              domain = DomainStore.get(route.domain_guid);
            }

            return (
              <AppActivity
                key={item.guid}
                item={item}
                service={service}
                route={route}
                domain={domain}
              />
            );
          })}
          {showMore}
        </ul>
      </div>
    );
  }
}

ActivityLog.propTypes = propTypes;
ActivityLog.defaultProps = defaultProps;
