package controllers

import (
	"fmt"
	"net/http"

	"github.com/gocraft/web"
)

// APIContext stores the session info and access token per user.
// All routes within APIContext represent the API routes
type apiContext struct {
	*secureContext // Required.
}

// APIProxy is a handler that serves as a proxy for all the CF API. Any route that comes in the /v2/* route
// that has not been specified, will just come here.
func (c *apiContext) APIProxy(rw web.ResponseWriter, req *web.Request) {
	reqURL := fmt.Sprintf("%s%s", c.Application.Settings.ConsoleAPI, req.URL)
	c.Proxy(rw, req.Request, reqURL, c.GenericResponseHandler)
}

// UserProfile redirects users to the `/profile` page
func (c *apiContext) UserProfile(rw web.ResponseWriter, req *web.Request) {
	profileURL := fmt.Sprintf("%s/profile", c.Application.Settings.LoginURL)
	http.Redirect(rw, req.Request, profileURL, http.StatusFound)
}

// AuthStatus simply returns authorized. This endpoint is just a quick endpoint to indicate that if a
// user can reach here after passing through the OAuth Middleware, they are authorized.
func (c *apiContext) AuthStatus(rw web.ResponseWriter, req *web.Request) {
	rw.Write([]byte(`{"status": "authorized"}`))
}
