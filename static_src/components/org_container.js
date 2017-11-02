import React, { Component } from "react";
import { I18n } from "react-i18next";

import { config } from "skin";
import UserStore from "../stores/user_store";
import OrgStore from "../stores/org_store";
import SpaceStore from "../stores/space_store";
import AppCountStatus from "./app_count_status";
import Breadcrumbs from "./breadcrumbs";
import EntityIcon from "./entity_icon";
import EntityEmpty from "./entity_empty";
import Loading from "./loading";
import PageHeader from "./page_header";
import Panel from "./panel";
import ServiceCountStatus from "./service_count_status";
import SpaceCountStatus from "./space_count_status";
import SpaceQuicklook from "./space_quicklook";
import Users from "./users";

const mapStoreToState = () => {
  const { currentOrgGuid } = OrgStore;
  const { currentSpaceGuid } = SpaceStore;
  const { currentUser } = UserStore;
  const currentUserGuid = currentUser && currentUser.guid;
  const currentUserCanViewSpace =
    UserStore.hasRole(currentUserGuid, currentOrgGuid, "org_manager") ||
    UserStore.hasRole(
      currentUserGuid,
      currentSpaceGuid,
      SpaceStore.viewPermissionRoles()
    );

  const org = OrgStore.get(currentOrgGuid);
  const spaces = SpaceStore.getAll()
    .filter(s => s.organization_guid === currentOrgGuid)
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    currentOrgGuid,
    currentUser,
    currentUserCanViewSpace,
    empty: !OrgStore.loading && !SpaceStore.loading && !org,
    loading: OrgStore.loading || SpaceStore.loading || UserStore.loading,
    org: org || {},
    spaces: spaces || []
  };
};

export default class OrgContainer extends Component {
  constructor(props) {
    super(props);

    this.state = mapStoreToState();

    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    OrgStore.addChangeListener(this.handleChange);
    SpaceStore.addChangeListener(this.handleChange);
    UserStore.addChangeListener(this.handleChange);
  }

  componentWillUnmount() {
    OrgStore.removeChangeListener(this.handleChange);
    SpaceStore.removeChangeListener(this.handleChange);
    UserStore.removeChangeListener(this.handleChange);
  }

  handleChange() {
    this.setState(mapStoreToState());
  }

  allServices() {
    return this.state.spaces.reduce((all, space) => {
      if (space.services && space.services.length) {
        return all.concat(space.services);
      }
      return all;
    }, []);
  }

  allApps() {
    return this.state.spaces.reduce((all, space) => {
      if (space.apps && space.apps.length) {
        return all.concat(space.apps);
      }
      return all;
    }, []);
  }

  renderEmptyState() {
    const { currentUserCanViewSpace } = this.state;

    if (currentUserCanViewSpace) {
      const spaceLink = config.docs.concepts_spaces ? (
        <a href={config.docs.concepts_spaces}>Spaces</a>
      ) : (
        "Spaces"
      );
      const contactLink = config.docs.contact ? (
        <a href={config.docs.contact}>contact us</a>
      ) : (
        "contact us"
      );

      return (
        <I18n>
          {t => (
            <EntityEmpty
              callout={t("You have no spaces in this organization.")}
            >
              <p>
                {spaceLink} are environments for development, deployment, and
                maintenance of apps and services. If you think you have spaces
                you don’t see here, {contactLink}.
              </p>
            </EntityEmpty>
          )}
        </I18n>
      );
    }

    return (
      <I18n>
        {t => (
          <EntityEmpty
            callout={t(
              "You don’t have permission to see the spaces in this organization."
            )}
          >
            <p>
              {t(
                "Organization auditors and billing managers can’t view spaces. Ask your organization’s administrator to give you these permissions."
              )}
            </p>
          </EntityEmpty>
        )}
      </I18n>
    );
  }

  render() {
    const {
      currentUser,
      currentOrgGuid,
      org,
      spaces,
      empty,
      loading
    } = this.state;

    if (loading) {
      return <I18n>{t => <Loading text={t("Loading organizations")} />}</I18n>;
    }

    if (empty) {
      return (
        <I18n>
          {t => <h4 className="test-none_message">{t("No organizations")}</h4>}
        </I18n>
      );
    }

    if (!spaces.length) {
      return this.renderEmptyState();
    }

    const allApps = this.allApps();
    const allServices = this.allServices();

    const title = (
      <span>
        <EntityIcon entity="org" iconSize="large" /> {org.name}
      </span>
    );

    return (
      <I18n>
        {t => (
          <div className="grid">
            <div className="grid">
              <div className="grid-width-12">
                <Breadcrumbs org={org} />
                <PageHeader title={title} />
              </div>
            </div>
            <Panel title="">
              <div className="grid panel-overview-header">
                <div className="grid-width-6">
                  <h1 className="panel-title">{t("Organization overview")}</h1>
                </div>
                <div className="grid-width-6">
                  <div className="count_status_container">
                    <SpaceCountStatus spaces={spaces} />
                    <AppCountStatus
                      apps={allApps}
                      appCount={allApps && allApps.length}
                    />
                    <ServiceCountStatus
                      services={allServices}
                      serviceCount={allServices && allServices.length}
                    />
                  </div>
                </div>
              </div>
              {spaces.map(space => (
                <SpaceQuicklook
                  key={space.guid}
                  space={space}
                  orgGuid={currentOrgGuid}
                  user={currentUser}
                  showAppDetail
                />
              ))}
            </Panel>
            <Panel title={t("Organization users")}>
              <Users />
            </Panel>
          </div>
        )}
      </I18n>
    );
  }
}
