package controllers

import (
	"github.com/gocraft/web"

	"github.com/18F/cg-dashboard/helpers"
)

// CreateRouter sets up the router (and subrouters).
// It also includes the closure middleware where we load the global Settings reference into each request.
func (s *Settings) CreateRouter() (*web.Router, error) {
	// Cache templates
	templates, err := helpers.InitTemplates(s.BasePath)
	if err != nil {
		return nil, err
	}

	router := web.New(dashboardContext{})

	// A closure that effectively loads the Settings into every request.
	router.Middleware(func(c *dashboardContext, resp web.ResponseWriter, req *web.Request, next web.NextMiddlewareFunc) {
		c.Settings = s
		c.Templates = templates
		c.Mailer = s.EmailSender
		next(resp, req)
	})

	// Looks for an OAuth token in the session and load into context
	router.Middleware((*dashboardContext).LoadSession)

	// Frontend Route Initialization
	// Set up static file serving to load from the static folder.
	router.Middleware(staticMiddleware("static"))

	router.Get("/", (*dashboardContext).Index)

	// Backend Route Initialization
	// Initialize the Gocraft Router with the basic context and routes
	router.Get("/ping", (*dashboardContext).Ping)
	router.Get("/handshake", (*dashboardContext).LoginHandshake)
	router.Get("/oauth2callback", (*dashboardContext).OAuthCallback)
	router.Get("/logout", (*dashboardContext).Logout)

	// While the above can be accessed with no authentication, for the
	// following authentication is required
	secureRouter := router.Subrouter(secureContext{}, "/")

	// Add auth middleware
	secureRouter.Middleware((*secureContext).LoginRequired)

	// Setup the /api subrouter.
	apiRouter := secureRouter.Subrouter(apiContext{}, "/v2")

	// All routes accepted
	apiRouter.Get("/authstatus", (*apiContext).AuthStatus)
	apiRouter.Get("/profile", (*apiContext).UserProfile)
	apiRouter.Get("/:*", (*apiContext).APIProxy)
	apiRouter.Put("/:*", (*apiContext).APIProxy)
	apiRouter.Post("/:*", (*apiContext).APIProxy)
	apiRouter.Delete("/:*", (*apiContext).APIProxy)

	// Setup the /uaa subrouter.
	uaaRouter := secureRouter.Subrouter(uaaContext{}, "/uaa")
	uaaRouter.Get("/userinfo", (*uaaContext).UserInfo)
	uaaRouter.Get("/uaainfo", (*uaaContext).UaaInfo)
	uaaRouter.Post("/invite/users", (*uaaContext).InviteUserToOrg)

	// Setup the /log subrouter.
	logRouter := secureRouter.Subrouter(logContext{}, "/log")
	logRouter.Get("/recent", (*logContext).RecentLogs)

	return router, nil
}
