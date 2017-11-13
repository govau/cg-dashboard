package controllers

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/gocraft/web"
)

// OrganizationContext allows for extra logic around the CF API calls.
type OrganizationContext struct {
	*APIContext // Required.
}

// PutUser is a CF API call.
func (c *OrganizationContext) PutUser(rw web.ResponseWriter, r *web.Request) {
	orgID := r.PathParams["id"]
	userID := r.PathParams["userId"]
	reqURL := fmt.Sprintf("%s%s", c.Settings.ConsoleAPI, r.URL)

	c.Proxy(rw, r.Request, reqURL, func(w http.ResponseWriter, apiResp *http.Response) {
		c.putUserSuccess(w, r.Request, apiResp, orgID, userID)
	})
}

func (c *OrganizationContext) putUserSuccess(w http.ResponseWriter, r *http.Request, apiResp *http.Response, orgID, userID string) {
	if err := c.notifyOfUserAssociation(orgID, userID); err != nil {
		c.errorWriter.HandleErr(w, r, err)
		return
	}

	c.GenericResponseHandler(w, apiResp)
}

func (c *OrganizationContext) notifyOfUserAssociation(orgID, userID string) error {
	pcfc, err := c.PrivilegedCFClient()
	if err != nil {
		return err
	}
	// Note: needs privileged credentials.
	grantee, err := pcfc.GetUserByGUID(userID)
	if err != nil {
		return err
	}

	cfc, err := c.CFClient()
	if err != nil {
		return err
	}

	// Note: does not need privileged credentials.
	org, err := cfc.GetOrgByGuid(orgID)
	if err != nil {
		return err
	}

	currentUserEmail, err := c.CurrentUserEmail()
	if err != nil {
		return err
	}

	// Note: does not need privileged credentials.
	managers, err := cfc.ListOrgManagers(orgID)
	if err != nil {
		return err
	}
	link := fmt.Sprintf("%s/#/org/%s", c.Settings.AppURL, orgID)
	recipients := []EmailTemplateUserAssociatedWithOrganizationData{
		{
			Email:        grantee.Username,
			GranteeEmail: grantee.Username,
			GranterEmail: currentUserEmail,
			OrgName:      org.Name,
			Link:         link,
		},
	}
	for _, m := range managers {
		recipients = append(recipients, EmailTemplateUserAssociatedWithOrganizationData{
			Email:        m.Username,
			GranteeEmail: grantee.Username,
			GranterEmail: currentUserEmail,
			OrgName:      org.Name,
			OrgManager:   true,
			Link:         link,
		})
	}

	t, ok := c.emailTemplates.Get(emailTemplateUserAssociatedWithOrganization)
	if !ok {
		return fmt.Errorf("could not find email template: %q", emailTemplateUserAssociatedWithOrganization)
	}

	var wg sync.WaitGroup
	done := make(chan bool, 1)
	errch := make(chan error, 1)

	for _, data := range recipients {
		wg.Add(1)
		go func(data EmailTemplateUserAssociatedWithOrganizationData) {
			defer wg.Done()

			subject, html, text, err := t.Execute(data)
			if err != nil {
				errch <- err
				return
			}
			errch <- c.mailer.SendEmail(
				data.Email,
				subject.String(),
				html.Bytes(),
				text.Bytes(),
			)
		}(data)
	}

	go func() {
		wg.Wait()
		close(done)
	}()

	select {
	case <-done:
	case err := <-errch:
		return err
	}

	return nil
}
