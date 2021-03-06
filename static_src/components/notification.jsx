
import PropTypes from 'prop-types';
import React from 'react';
import keymirror from 'keymirror';

import Action from './action.jsx';
import createStyler from '../util/create_styler';
import { entityHealth } from '../constants.js';
import style from 'cloudgov-style/css/cloudgov-style.css';

const STATUSES = Object.assign({}, entityHealth, keymirror({
  info: null
}));


const propTypes = {
  message: PropTypes.node,
  status: PropTypes.oneOf(Object.keys(STATUSES)),
  actions: PropTypes.arrayOf(PropTypes.object),
  onDismiss: PropTypes.func
};

const defaultProps = {
  message: 'There was a problem',
  status: entityHealth.warning,
  actions: [],
  onDismiss: () => {}
};

export default class Notification extends React.Component {
  constructor(props) {
    super(props);

    this.styler = createStyler(style);

    this.onCloseClick = this.onCloseClick.bind(this);
  }

  onCloseClick(ev) {
    ev.preventDefault();
    this.props.onDismiss(ev);
  }

  render() {
    const statusClass = `notification-${this.props.status}`;
    let content = <span>{ this.props.message }</span>;
    let actionElements;

    if (this.props.actions.length) {
      actionElements = this.props.actions.map((action, i) => (
        <Action key={ `notificationAction-${i}` } type="outline" style="white"
          clickHandler={ action.clickHandler }
          classes={ ['notification-action', 'test-notification-action'] }
        >
          { action.text }
        </Action>
      ));
    }

    return (
    <div className={ this.styler('notification', statusClass, 'test-notification') }>
      <div className={ this.styler('notification-wrap') }>
        <p className={ this.styler('notification-message', 'test-notification-message') }>
          { content }
        </p>
        { actionElements }
        <a className={ this.styler('notification-dismiss', 'test-notification-dismiss') }
          onClick={ this.onCloseClick }
          title="Dismiss notification"
          href="#"
        >
          <span className={ this.styler('usa-sr-only') }>Close</span>
        </a>
      </div>
    </div>
    );
  }
}

Notification.propTypes = propTypes;
Notification.defaultProps = defaultProps;
