package controllers

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gocraft/web"

	"github.com/18F/cg-dashboard/jsonerror"
)

func newStdLogger() *stdLogger {
	return &stdLogger{
		logger: log.New(os.Stderr, "", log.LstdFlags),
	}
}

type stdLogger struct {
	logger *log.Logger
}

// Log implements jsonerror.Logger.
func (s *stdLogger) Log(args ...interface{}) {
	s.logger.Print(args...)
}

// Logf implements jsonerror.Logger.
func (s *stdLogger) Logf(format string, args ...interface{}) {
	s.logger.Printf(format, args...)
}

// APIContext stores the session info and access token per user.
// All routes within APIContext represent the API routes
type APIContext struct {
	*SecureContext // Required.
	errorWriter    *jsonerror.Writer
}

// APIProxy is a handler that serves as a proxy for all the CF API. Any route that comes in the /v2/* route
// that has not been specified, will just come here.
func (c *APIContext) APIProxy(rw web.ResponseWriter, req *web.Request) {
	reqURL := fmt.Sprintf("%s%s", c.Settings.ConsoleAPI, req.URL)
	c.Proxy(rw, req.Request, reqURL, c.GenericResponseHandler)
}

// UserProfile redirects users to the `/profile` page
func (c *APIContext) UserProfile(rw web.ResponseWriter, req *web.Request) {
	profileURL := fmt.Sprintf("%s%s", c.Settings.LoginURL, "/profile")
	http.Redirect(rw, req.Request, profileURL, http.StatusFound)
}

// AuthStatus simply returns authorized. This endpoint is just a quick endpoint to indicate that if a
// user can reach here after passing through the OAuth Middleware, they are authorized.
func (c *APIContext) AuthStatus(rw web.ResponseWriter, req *web.Request) {
	rw.Write([]byte("{\"status\": \"authorized\"}"))
}
