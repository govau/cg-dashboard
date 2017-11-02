import React from "react";
import PropTypes from "prop-types";
import { I18n } from "react-i18next";

import AppCountStatus from "./app_count_status";
import ElasticLine from "./elastic_line";
import ElasticLineItem from "./elastic_line_item";
import EntityIcon from "./entity_icon";
import ExpandableBox from "./expandable_box";
import Loading from "./loading";
import SpaceCountStatus from "./space_count_status";
import SpaceQuicklook from "./space_quicklook";
import orgActions from "../actions/org_actions";
import { orgHref } from "../util/url";

const propTypes = {
  org: PropTypes.object.isRequired,
  spaces: PropTypes.array
};

const defaultProps = {
  spaces: []
};

export default class OrgQuicklook extends React.Component {
  constructor(props) {
    super(props);

    this.handleRowClick = this.handleRowClick.bind(this);
    this.handleOrgClick = this.handleOrgClick.bind(this);
  }

  orgHref() {
    return orgHref(this.props.org.guid);
  }

  totalAppCount(spaces) {
    return spaces.reduce((sum, space) => sum + space.app_count, 0);
  }

  allApps() {
    return this.props.spaces.reduce((all, space) => {
      if (space.apps && space.apps.length) {
        return all.concat(space.apps);
      }
      return all;
    }, []);
  }

  get spacesContent() {
    if (!this.props.org.quicklook || !this.props.org.quicklook.open) {
      return null;
    }

    if (!this.props.org.quicklook.isLoaded) {
      return <Loading />;
    }

    if (!this.props.spaces.length) {
      return <I18n>{t => <h4>{t("No spaces in this organization")}</h4>}</I18n>;
    }

    return this.props.spaces.map(space => (
      <SpaceQuicklook
        space={space}
        orgGuid={this.props.org.guid}
        key={space.guid}
      />
    ));
  }

  handleRowClick(e) {
    e.preventDefault();
    orgActions.toggleQuicklook(this.props.org);
  }

  handleOrgClick(e) {
    e.preventDefault();
    window.location.href = this.orgHref();
  }

  render() {
    const { org } = this.props;
    const expand = !!(org.quicklook && org.quicklook.open);

    return (
      <ExpandableBox
        clickHandler={this.handleRowClick}
        isExpanded={expand}
        classes={["test-org-quicklook"]}
        clickableContent={
          <ElasticLine>
            <ElasticLineItem>
              <h2 className="card-title-primary">
                <EntityIcon entity="org" iconSize="medium" />
                <a
                  onClick={this.handleOrgClick}
                  className="test-org-quicklook-title"
                >
                  {org.name}
                </a>
              </h2>
            </ElasticLineItem>
            <ElasticLineItem align="end">
              <div className="count_status_container">
                <SpaceCountStatus spaces={org.spaces} />
                <AppCountStatus
                  appCount={this.totalAppCount(org.spaces)}
                  apps={this.allApps()}
                />
              </div>
            </ElasticLineItem>
          </ElasticLine>
        }
      >
        {this.spacesContent}
      </ExpandableBox>
    );
  }
}

OrgQuicklook.propTypes = propTypes;
OrgQuicklook.defaultProps = defaultProps;
