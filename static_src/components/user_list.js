import React from "react";
import PropTypes from "prop-types";
import { I18n } from "react-i18next";

import Action from "./action";
import ComplexList from "./complex_list";
import ElasticLine from "./elastic_line";
import ElasticLineItem from "./elastic_line_item";
import EntityEmpty from "./entity_empty";
import Loading from "./loading";
import PanelDocumentation from "./panel_documentation";
import UserRoleListControl from "./user_role_list_control";
import { config } from "skin";

const userTypes = {
  orgUsers: "org_users",
  spaceUsers: "space_users"
};

const propTypes = {
  users: PropTypes.array,
  userType: PropTypes.string,
  entityGuid: PropTypes.string,
  currentUserAccess: PropTypes.bool,
  empty: PropTypes.bool,
  loading: PropTypes.bool,
  saving: PropTypes.bool,
  savingText: PropTypes.string,
  // Set to a function when there should be a remove button.
  onRemove: PropTypes.func,
  onRemovePermissions: PropTypes.func,
  onAddPermissions: PropTypes.func
};

const defaultProps = {
  users: [],
  userType: userTypes.spaceUsers,
  currentUserAccess: false,
  saving: false,
  savingText: "",
  empty: false,
  loading: false
};

export default class UserList extends React.Component {
  constructor(props) {
    super(props);

    this._handleDelete = this._handleDelete.bind(this);
  }

  _handleDelete(userGuid, ev) {
    this.props.onRemove(userGuid, ev);
  }

  get columns() {
    const columns = [
      { label: "User Name", key: "username" },
      { label: "Roles", key: "permissions" },
      { label: "Date Created", key: "created_at" }
    ];

    if (this.props.onRemove) {
      columns.push({ label: "Actions", key: "actions" });
    }

    return columns;
  }

  get documentation() {
    return (
      <I18n>
        {t => (
          <PanelDocumentation description>
            <p>
              {this.props.userType === userTypes.orgUsers
                ? t("Organization Managers can change these roles.")
                : "Space Managers can change these roles."}{" "}
              For details about these roles, see{" "}
              <a href="https://docs.cloudfoundry.org/concepts/roles.html#roles">
                Cloud Foundry roles and permissions
              </a>.
              {config.docs.invite_user ? (
                <span>
                  {" "}
                  To invite a user and give them roles, see{" "}
                  <a href={config.docs.invite_user}>Managing Teammates</a>.{" "}
                  <b>
                    {t(
                      "Removing all roles does not remove a user from an organization. Users with no roles can view other users and their roles while being unable to make any changes."
                    )}
                  </b>
                </span>
              ) : null}
            </p>
          </PanelDocumentation>
        )}
      </I18n>
    );
  }

  get emptyState() {
    return (
      <I18n>
        {t => (
          <EntityEmpty
            callout={
              this.props.userType === userTypes.orgUsers
                ? t("There are no users in this organization")
                : "There are no users in this space"
            }
          >
            {config.docs.invite_user && (
              <a href={config.docs.invite_user}>
                Read more about adding users to this space.
              </a>
            )}
          </EntityEmpty>
        )}
      </I18n>
    );
  }

  render() {
    let buttonText;
    let content = (
      <div>
        <Loading text="Loading users" />
      </div>
    );

    if (this.props.empty) {
      content = this.emptyState;
    } else if (!this.props.loading && this.props.users.length) {
      content = (
        <div className="test-user_list">
          <Loading
            active={this.props.saving}
            loadingDelayMS={0}
            text="Saving"
            style="globalSaving"
          />
          {this.documentation}
          <ComplexList>
            {this.props.users.map(user => {
              let actions;
              if (this.props.onRemove) {
                let button = <span />;
                if (this.props.currentUserAccess) {
                  if (this.props.userType === userTypes.orgUsers) {
                    buttonText = "Remove User From Org";
                  } else if (this.props.userType === userTypes.spaceUsers) {
                    buttonText = "Remove All Space Roles";
                  }
                  button = (
                    <Action
                      style="base"
                      clickHandler={this._handleDelete.bind(this, user.guid)}
                      label="delete"
                    >
                      <span>{buttonText}</span>
                    </Action>
                  );
                }
                actions = (
                  <ElasticLineItem align="end">{button}</ElasticLineItem>
                );
              }

              return (
                <ElasticLine key={user.guid}>
                  <ElasticLineItem>{user.username}</ElasticLineItem>
                  <ElasticLineItem key={`${user.guid}-role`} align="end">
                    <UserRoleListControl
                      userType={this.props.userType}
                      currentUserAccess={this.props.currentUserAccess}
                      onAddPermissions={this.props.onAddPermissions}
                      onRemovePermissions={this.props.onRemovePermissions}
                      entityGuid={this.props.entityGuid}
                      user={user}
                    />
                  </ElasticLineItem>
                  {actions}
                </ElasticLine>
              );
            })}
          </ComplexList>
        </div>
      );
    }

    return <div className="tableWrapper">{content}</div>;
  }
}

UserList.propTypes = propTypes;
UserList.defaultProps = defaultProps;
