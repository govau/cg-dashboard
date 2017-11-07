package controllers

import "github.com/govau/emailtemplate"

const (
	emailTemplateUserInvited emailtemplate.Key = "userInvited"
)

// EmailTemplateUserInvitedData is the template data that should be passed to
// the emailTemplateUserInvited email template.
type EmailTemplateUserInvitedData struct {
	// Email is the email address of the recipient.
	Email string
	// URL is the link that the user uses to accept their invitation.
	URL string
}
