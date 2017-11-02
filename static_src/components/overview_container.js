import React from "react";
import { I18n } from "react-i18next";

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

function stateSetter() {
  const orgs = OrgStore.getAll() || [];
  const spaces = SpaceStore.getAll() || [];

  return {
    empty: !PageStore.loading && !orgs.length,
    loading: PageStore.loading,
    orgs: orgs.sort((a, b) => a.name.localeCompare(b.name)),
    spaces
  };
}

export default class OverviewContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = stateSetter();
    this._onChange = this._onChange.bind(this);
  }

  componentDidMount() {
    OrgStore.addChangeListener(this._onChange);
    PageStore.addChangeListener(this._onChange);
    SpaceStore.addChangeListener(this._onChange);
  }

  componentWillUnmount() {
    OrgStore.removeChangeListener(this._onChange);
    PageStore.removeChangeListener(this._onChange);
    SpaceStore.removeChangeListener(this._onChange);
  }

  _onChange() {
    this.setState(stateSetter());
  }

  orgSpaces(orgGuid) {
    return this.state.spaces.filter(
      space => space.organization_guid === orgGuid
    );
  }

  anyOrgsOpen() {
    return this.state.orgs.reduce(
      (prev, org) => prev || !!(org.quicklook && org.quicklook.open),
      false
    );
  }

  get emptyState() {
    const contactMsg = config.docs.contact && (
      <span>
        <br />
        If this isn’t the case, <a href={config.docs.contact}>contact us</a>.
      </span>
    );

    return (
      <I18n>
        {t => (
          <EntityEmpty callout={t("We can’t find any of your organizations.")}>
            <p>
              {t(
                "If you just joined, your organization may not yet be ready. Sometimes organizations can take up to 20 minutes to appear on your first login."
              )}
              {contactMsg}
            </p>
          </EntityEmpty>
        )}
      </I18n>
    );
  }

  render() {
    const state = this.state;
    const loading = <Loading text="Loading orgs" />;
    let content = <div>{loading}</div>;
    const title = (
      <span>
        <Icon name="home" bordered iconType="fill" iconSize="large" /> Overview
      </span>
    );

    if (state.empty) {
      content = this.emptyState;
    } else if (
      (!state.loading && this.state.orgs.length > 0) ||
      this.anyOrgsOpen()
    ) {
      content = (
        <div>
          {state.orgs.map(org => (
            <div key={org.guid} className="test-panel-row-organizations">
              <OrgQuicklook org={org} spaces={this.orgSpaces(org.guid)} />
            </div>
          ))}
        </div>
      );
    }

    const { panels = [] } = homePage;

    return (
      <div className="grid">
        <PageHeader title={title} />
        <I18n>
          {t => <Panel title={t("Your organizations")}>{content}</Panel>}
        </I18n>
        {panels.map((render, i) => <div key={i}>{render()}</div>)}
      </div>
    );
  }
}
