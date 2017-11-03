import React from "react";
import PropTypes from "prop-types";

import ErrorStore from "../stores/error_store";
import LoginStore from "../stores/login_store";
import OrgStore from "../stores/org_store";
import userProvider from "./user_provider";
import Disclaimer from "./header/disclaimer";
import Footer from "./footer";
import GlobalErrorContainer from "./global_error_container";
import Header from "./header";
import SpaceStore from "../stores/space_store";

const propTypes = { children: PropTypes.any };

const mapStoreToState = () => ({
  errors: ErrorStore.getAll() || [],
  currentOrgGuid: OrgStore.currentOrgGuid,
  currentSpaceGuid: SpaceStore.currentSpaceGuid,
  isLoggedIn: LoginStore.isLoggedIn()
});

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = mapStoreToState();
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    ErrorStore.addChangeListener(this.handleChange);
    LoginStore.addChangeListener(this.handleChange);
  }

  componentWillUnmount() {
    ErrorStore.removeChangeListener(this.handleChange);
    LoginStore.removeChangeListener(this.handleChange);
  }

  handleChange() {
    this.setState(mapStoreToState());
  }

  render() {
    const { children } = this.props;
    const { errors } = this.state;

    return [
      <Disclaimer key="disclaimer" />,
      <Header key="header" />,
      <div key="main" className="main_content content-no_sidebar">
        {errors.length > 0 ? (
          <GlobalErrorContainer errors={errors} />
        ) : (
          <main className="usa-content">
            <div className="content grid">{children}</div>
          </main>
        )}
      </div>,
      <Footer key="footer" />
    ];
  }
}

App.propTypes = propTypes;

App.defaultProps = {
  children: []
};

export default userProvider(App);
