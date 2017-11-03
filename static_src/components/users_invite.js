/**
 * Renders a form that allows org users to invite new users
 * to cloud.gov
 */

import React from "react";
import PropTypes from "prop-types";
import { translate } from "react-i18next";

import { generateId } from "../util/element_id";
import { validateEmail } from "../util/validators";
import Action from "./action";
import FormStore from "../stores/form_store";
import { Form, FormText } from "./form";
import PanelDocumentation from "./panel_documentation";
import userActions from "../actions/user_actions";

const propTypes = {
  t: PropTypes.func.isRequired,
  inviteDisabled: PropTypes.bool,
  entityType: PropTypes.oneOf(["organization", "space"]).isRequired,
  currentUserAccess: PropTypes.bool,
  error: PropTypes.object
};

const defaultProps = {
  inviteDisabled: false,
  currentUserAccess: false,
  error: {}
};

export class UsersInvite extends React.Component {
  constructor(props) {
    super(props);

    this.formId = generateId("users_invite_form_");

    FormStore.create(this.formId);

    this.validateEmail = validateEmail().bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(errs, values) {
    let email = "";

    if (values.email) {
      email = values.email.value;
    }

    const isEmailValid = this.validateEmail(email, "email") === null;

    if (isEmailValid) {
      userActions.createUserInvite(email);
    }
  }

  renderErrorMessage() {
    const { error } = this.props;

    if (!error) return "";

    const message = error.contextualMessage;

    if (error.message) {
      return `${message}: ${error.message}.`;
    }

    return message;
  }

  render() {
    const { t, entityType, inviteDisabled, currentUserAccess } = this.props;

    if (!currentUserAccess) {
      return null;
    }

    return (
      <div className="test-users-invite">
        <PanelDocumentation description>
          <p>{t(`Invite a new or existing user to this ${entityType}.`)}</p>
        </PanelDocumentation>
        <Form
          guid={this.formId}
          classes={["users_invite_form"]}
          ref="form"
          onSubmit={this.handleSubmit}
          errorOverride={this.renderErrorMessage()}
        >
          <FormText
            formGuid={this.formId}
            classes={["test-users_invite_name"]}
            label="User’s email"
            name="email"
            validator={this.validateEmail}
          />
          <Action label="submit" type="submit" disabled={inviteDisabled}>
            {t(`Add user to this ${this.props.entityType}`)}
          </Action>
        </Form>
      </div>
    );
  }
}

UsersInvite.propTypes = propTypes;

UsersInvite.defaultProps = defaultProps;

export default translate()(UsersInvite);
