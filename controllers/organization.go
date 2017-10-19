package controllers

import (
	"fmt"
	"net/http"

	"github.com/gocraft/web"
	"github.com/govau/emailtemplate"
)

type OrganizationContext struct {
	*APIContext    // Required.
	emailTemplates emailtemplate.Getter
}

func (c *OrganizationContext) PutUser(rw web.ResponseWriter, req *web.Request) {
	id := req.PathParams["id"]
	userID := req.PathParams["userId"]
	reqURL := fmt.Sprintf("%s%s", c.Settings.ConsoleAPI, req.URL)
	c.Proxy(rw, req.Request, reqURL, func(w http.ResponseWriter, apiResp *http.Response) {
		c.putUser(w, apiResp, id, userID)
	})
}

func (c *OrganizationContext) putUser(w http.ResponseWriter, apiResp *http.Response, id, userID string) {
	t, ok := c.emailTemplates.Get(emailTemplateUserAssociatedWithOrganization)
	if !ok {
		panic("no email template") // TODO
	}
	subject, html, _, err := t.Execute(nil)
	if err != nil {
		panic(err) // TODO
	}
	if err := c.mailer.SendEmail(
		"jonathan.ingram+todo@digital.gov.au",
		subject.String(),
		html.Bytes(),
	); err != nil {
		panic(err) // TODO
	}
	c.GenericResponseHandler(w, apiResp)
}
