package controllers

import "github.com/govau/emailtemplate"

const (
	emailTemplateUserInvited                    emailtemplate.Key = "userInvited"
	emailTemplateUserAssociatedWithOrganization                   = "userAssociatedWithOrganization"
	emailTemplateUserAssociatedWithSpace                          = "userAssociatedWithSpace"
)

// EmailTemplateUserInvitedData is the template data that should be passed to
// the emailTemplateUserInvited email template.
type EmailTemplateUserInvitedData struct {
	// Email is the email address of the recipient.
	Email string
	// Link is the URL that the user uses to accept their invitation.
	Link string
}

// EmailTemplateUserAssociatedWithOrganizationData is the template data that
// should be passed to the emailTemplateUserAssociatedWithOrganization email
// template.
type EmailTemplateUserAssociatedWithOrganizationData struct {
	// Email is the email address of the recipient.
	Email string
	// GranteeEmail is the email address of the user that has been associated
	// with the organization.
	GranteeEmail string
	// GranterEmail is the email address of the user that performed the action.
	GranterEmail string
	// OrgName is the name of the organization to which the user has been
	// associated.
	OrgName string
	// OrgManager indicates if the recipient is an organization manager.
	OrgManager bool
	// Link is the URL that the recipient uses to go to the organization.
	Link string
}

// EmailTemplateUserAssociatedWithSpaceData is the template data that
// should be passed to the emailTemplateUserAssociatedWithSpace email template.
type EmailTemplateUserAssociatedWithSpaceData struct {
	// Email is the email address of the recipient.
	Email string
	// GranteeEmail is the email address of the user that has been associated
	// with the space.
	GranteeEmail string
	// GranterEmail is the email address of the user that performed the action.
	GranterEmail string
	// OrgName is the name of the organization in which the space belongs.
	OrgName string
	// SpaceName is the name of the space to which the user has been associated.
	SpaceName string
	// SpaceManager indicates if the recipient is a space manager.
	SpaceManager bool
	// Link is the URL that the recipient uses to go to the space.
	Link string
}
