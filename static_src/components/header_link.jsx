
import style from 'cloudgov-style/css/cloudgov-style.css';
import PropTypes from 'prop-types';
import React from 'react';

import createStyler from '../util/create_styler';

const propTypes = {
  url: PropTypes.string,
  text: PropTypes.string,
  children: PropTypes.any,
  classes: PropTypes.array
};

export default class HeaderLink extends React.Component {

  constructor(props) {
    super(props);
    this.styler = createStyler(style);
  }

  render() {
    let linkContent = (<a href={this.props.url} className={ this.styler(this.props.classes) }>
      {this.props.text}</a>);
    if (this.props.children) {linkContent = this.props.children;}
    return (
      <li className={ this.styler('nav-link') }>
        {linkContent}
      </li>
    );
  }
}

HeaderLink.propTypes = propTypes;
