import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment-timezone";
import styled from "styled-components";

import Action from "./action";

import ActivityStore from "../stores/activity_store";
import AppStore from "../stores/app_store";
import DomainStore from "../stores/domain_store";
import RouteStore from "../stores/route_store";
import ServiceInstanceStore from "../stores/service_instance_store";
import ErrorMessage from "./error_message";
import PanelActions from "./panel_actions";
import DailyBucket from "./app_activity/daily_bucket";

const Buckets = styled.div`
  margin-top: 1rem;
`;

const itemsToDailyBuckets = items => {
  const buckets = {};
  for (const item of items) {
    const timestamp = moment(item.timestamp).tz(moment.tz.guess());
    const date = timestamp.format("YYYY-MM-DD z");
    buckets[date] = buckets[date] || { date, items: [] };
    buckets[date].items.push(item);
  }
  return Object.keys(buckets).map(date => buckets[date]);
};

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

export default class ActivityLog extends Component {
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
        <Buckets>
          {itemsToDailyBuckets(
            activity.slice(0, maxItems)
          ).map(({ date, items }) => (
            <DailyBucket key={date} date={date} items={items} />
          ))}
        </Buckets>
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
      </div>
    );
  }
}

ActivityLog.propTypes = propTypes;
ActivityLog.defaultProps = defaultProps;
