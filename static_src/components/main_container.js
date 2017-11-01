import React from "react";
import PropTypes from "prop-types";
import userProvider from "./user_provider";
import Disclaimer from "./header/disclaimer";
import Footer from "./footer";
import GlobalErrorContainer from "./global_error_container";
import Header from "./header";
import LoginStore from "../stores/login_store";
import OrgStore from "../stores/org_store";
import SpaceStore from "../stores/space_store";

const propTypes = {
  children: PropTypes.any
};

function stateSetter() {
  return {
    currentOrgGuid: OrgStore.currentOrgGuid,
    currentSpaceGuid: SpaceStore.currentSpaceGuid,
    isLoggedIn: LoginStore.isLoggedIn()
  };
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = stateSetter();
    this._onChange = this._onChange.bind(this);
  }

  componentDidMount() {
    LoginStore.addChangeListener(this._onChange);
  }

  componentWillUnmount() {
    LoginStore.removeChangeListener(this._onChange);
  }

  _onChange() {
    this.setState(stateSetter());
  }

  render() {
    return (
      <div>
        <Disclaimer />
        <Header />
        <div className="main_content content-no_sidebar">
          <GlobalErrorContainer />
          <main className="usa-content">
            <div className="content grid">{this.props.children}</div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }
}

App.propTypes = propTypes;

App.defaultProps = {
  children: []
};

export default userProvider(App);
