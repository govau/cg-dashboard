
import PropTypes from 'prop-types';
import React from 'react';

import ElasticLine from './elastic_line.jsx';
import ElasticLineItem from './elastic_line_item.jsx';
import EntityIcon from './entity_icon.jsx';
import createStyler from '../util/create_styler';
import style from 'cloudgov-style/css/cloudgov-style.css';
import { appHref } from '../util/url';
import { appHealth, isHealthyApp } from '../util/health';

const EXTRA_INFO = [
  'state',
  'memory',
  'diskQuota'
];

const propTypes = {
  app: PropTypes.object.isRequired,
  orgGuid: PropTypes.string.isRequired,
  spaceGuid: PropTypes.string.isRequired,
  spaceName: PropTypes.string,
  extraInfo: PropTypes.arrayOf((propVal) => EXTRA_INFO.includes(propVal))
};

const defaultProps = {
  extraInfo: ['state']
};

export default class AppQuicklook extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.styler = createStyler(style);
  }

  appHref() {
    const props = this.props;
    const appGuid = props.app.guid;
    return appHref(props.orgGuid, props.spaceGuid, appGuid);
  }

  appState(app) {
    const health = appHealth(app);
    const statusClass = `status-${health}`;
    return (
      <span className={ this.styler('status', statusClass) }>
        { app.state.toLowerCase() }
      </span>
    );
  }

  appName() {
    const app = this.props.app;
    const statusClass = !isHealthyApp(app) && 'status-error';

    return (
      <a className={ this.styler(statusClass) } href={ this.appHref() }>
        { app.name }
      </a>
    );
  }

  render() {
    const app = this.props.app;
    let info = [];

    if (this.props.extraInfo.includes('state')) {
      const oneInfo = this.props.extraInfo.length === 1;

      // Only show the state if app is crashed or theres only one extra col
      if (!isHealthyApp(app) || oneInfo) {
        info.push(
          <ElasticLineItem key="1">
            { this.appState(app) }
          </ElasticLineItem>
        );
      }
    }
    if (this.props.extraInfo.includes('memory')) {
      info.push(
        <ElasticLineItem key="2" align="end">
          { app.memory } MB <br />
          <span className={ this.styler('subtext') }>memory allocated</span>
        </ElasticLineItem>
      );
    }
    if (this.props.extraInfo.includes('diskQuota')) {
      info.push(
        <ElasticLineItem key="3" align="end">
          { app.disk_quota } MB <br />
          <span className={ this.styler('subtext') }>disk quota</span>
        </ElasticLineItem>
      );
    }

    return (
      <ElasticLine>
        <ElasticLineItem>
          <h3 className={ this.styler('contents-secondary') }>
            <EntityIcon entity="app" health={ appHealth(app) } iconSize="medium" />
            <span className={ this.styler('contents-path') }>
              { this.props.spaceName } / </span>{ this.appName() }
          </h3>
        </ElasticLineItem>
        { info }
      </ElasticLine>
    );
  }
}

AppQuicklook.propTypes = propTypes;
AppQuicklook.defaultProps = defaultProps;
