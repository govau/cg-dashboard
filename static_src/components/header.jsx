
import style from 'cloudgov-style/css/cloudgov-style.css';
import React from 'react';

import LoginStore from '../stores/login_store.js';
import HeaderLink from './header_link.jsx';
import logo from './cloud.gov.au-logo.svg';

import Action from './action.jsx';
import createStyler from '../util/create_styler';
import { config } from 'skin';

export default class Header extends React.Component {

  constructor(props) {
    super(props);
    this.styler = createStyler(style);
  }

  getImagePath(iconName) {
    const img = require('cloudgov-style/img/cloudgov-sprite.svg');
    return `/assets/${img}#${iconName}`;
  }

  render() {
    const loggedIn = LoginStore.isLoggedIn();
    let loginLink = (!loggedIn) ?
    <HeaderLink>
      <Action href="/handshake" label="Login" type="outline">
        Login
      </Action>
    </HeaderLink> :
    <HeaderLink>
      <Action href="/logout" label="Log out" type="outline">
        Log out
      </Action>
    </HeaderLink>;
    return (
    <header className={ this.styler('header', 'header-no_sidebar', 'test-header') }>
      <div className={ this.styler('header-wrap') }>
        <div className={ this.styler('header-title') } style={{marginTop: '-0.45rem'}}>
          <img src={logo} alt="console" style={{
            float: 'left',
            width: '40px',
            paddingTop: '13px',
            paddingRight: '10px'
          }} />
          <span style={{display: 'inline-block', color: '#17788d', fontSize: '2.25rem', fontWeight: 300}}>console</span>
        </div>
        <nav className={ this.styler('header-side') }>
          <ul className={ this.styler('nav') }>
            { config.header.links.map((link, index) =>
                <HeaderLink url={link.url} text={link.text} key={index} />)
            }
            { loginLink }
          </ul>
        </nav>
      </div>
    </header>
    );
  }
}
