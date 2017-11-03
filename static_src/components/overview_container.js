import React from "react";
import PropTypes from "prop-types";
import { translate } from "react-i18next";

import { config, homePage } from "skin";
import EntityEmpty from "./entity_empty";
import Icon from "./icon";
import Loading from "./loading";
import OrgQuicklook from "./org_quicklook";
import OrgStore from "../stores/org_store";
import PageHeader from "./page_header";
import PageStore from "../stores/page_store";
import Panel from "./panel";
import SpaceStore from "../stores/space_store";

const propTypes = {
  t: PropTypes.func.isRequired
};

const mapStoreToState = () => {
  const orgs = OrgStore.getAll() || [];
  const spaces = SpaceStore.getAll() || [];

  return {
    loading: PageStore.loading,
    orgs: orgs.sort((a, b) => a.name.localeCompare(b.name)),
    spaces
  };
};

class OverviewContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = mapStoreToState();

    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    OrgStore.addChangeListener(this.handleChange);
    PageStore.addChangeListener(this.handleChange);
    SpaceStore.addChangeListener(this.handleChange);
  }

  componentWillUnmount() {
    OrgStore.removeChangeListener(this.handleChange);
    PageStore.removeChangeListener(this.handleChange);
    SpaceStore.removeChangeListener(this.handleChange);
  }

  handleChange() {
    this.setState(mapStoreToState());
  }

  spacesInOrg(guid) {
    return this.state.spaces.filter(s => s.organization_guid === guid);
  }

  renderOrgsPanelContent() {
    const { t } = this.props;
    const { loading, orgs } = this.state;

    if (loading) {
      return <Loading text={t("Loading organizations")} />;
    }

    if (!orgs.length) {
      return (
        <EntityEmpty callout={t("We can’t find any of your organizations.")}>
          <p>
            {t(
              "If you just joined, your organization may not yet be ready. Sometimes organizations can take up to 20 minutes to appear on your first login."
            )}
            {config.docs.contact && (
              <span>
                <br />
                If this isn’t the case,{" "}
                <a href={config.docs.contact}>contact us</a>.
              </span>
            )}
          </p>
        </EntityEmpty>
      );
    }

    return orgs.map(org => (
      <div key={org.guid} data-test="organizations-panel-row">
        <OrgQuicklook org={org} spaces={this.spacesInOrg(org.guid)} />
      </div>
    ));
  }

  render() {
    const { t } = this.props;

    const { panels = [] } = homePage;

    return (
      <div className="grid">
        <PageHeader
          title={
            <span>
              <Icon
                name="home"
                bordered
                iconType="fill"
                iconSize="large"
              />{" "}
              Overview
            </span>
          }
        />
        <Panel title={t("Your organizations")}>
          {this.renderOrgsPanelContent()}
        </Panel>
        {panels.map((render, i) => <div key={i}>{render()}</div>)}
      </div>
    );
  }
}

OverviewContainer.propTypes = propTypes;

export default translate()(OverviewContainer);
