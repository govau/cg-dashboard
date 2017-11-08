package controllers

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/gocraft/web"
)

type SpaceContext struct {
	*APIContext // Required.
}

func (c *SpaceContext) PutAuditor(rw web.ResponseWriter, r *web.Request) {
	spaceID := r.PathParams["id"]
	userID := r.PathParams["userId"]
	reqURL := fmt.Sprintf("%s%s", c.Settings.ConsoleAPI, r.URL)

	c.Proxy(rw, r.Request, reqURL, func(w http.ResponseWriter, apiResp *http.Response) {
		c.putAuditorSuccess(w, r.Request, apiResp, spaceID, userID)
	})
}

func (c *SpaceContext) putAuditorSuccess(w http.ResponseWriter, r *http.Request, apiResp *http.Response, spaceID, userID string) {
	if err := c.notifyOfAuditorAssociation(spaceID, userID); err != nil {
		c.ErrorWriter.HandleErr(w, r, err)
		return
	}

	c.GenericResponseHandler(w, apiResp)
}

func (c *SpaceContext) notifyOfAuditorAssociation(spaceID, userID string) error {
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
	space, err := cfc.GetSpaceByGuid(spaceID)
	if err != nil {
		return err
	}
	// Note: does not need privileged credentials.
	org, err := cfc.GetOrgByGuid(space.OrganizationGuid)
	if err != nil {
		return err
	}

	currentUserEmail, err := c.CurrentUserEmail()
	if err != nil {
		return err
	}

	// Note: does not need privileged credentials.
	managers, err := cfc.ListSpaceManagers(spaceID)
	if err != nil {
		return err
	}
	link := fmt.Sprintf("%s/#/org/%s/spaces/%s", c.Settings.AppURL, org.Guid, spaceID)
	recipients := []EmailTemplateUserAssociatedWithSpaceData{
		{
			Email:        grantee.Username,
			GranteeEmail: grantee.Username,
			GranterEmail: currentUserEmail,
			OrgName:      org.Name,
			SpaceName:    space.Name,
			Link:         link,
		},
	}
	for _, m := range managers {
		recipients = append(recipients, EmailTemplateUserAssociatedWithSpaceData{
			Email:        m.Username,
			GranteeEmail: grantee.Username,
			GranterEmail: currentUserEmail,
			OrgName:      org.Name,
			SpaceName:    space.Name,
			SpaceManager: true,
			Link:         link,
		})
	}

	t, ok := c.emailTemplates.Get(emailTemplateUserAssociatedWithSpace)
	if !ok {
		return fmt.Errorf("could not find email template: %q", emailTemplateUserAssociatedWithSpace)
	}

	var wg sync.WaitGroup
	done := make(chan bool, 1)
	errch := make(chan error, 1)

	for _, data := range recipients {
		wg.Add(1)
		go func(data EmailTemplateUserAssociatedWithSpaceData) {
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
