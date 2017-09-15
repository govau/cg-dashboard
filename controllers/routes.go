package controllers

import (
	"github.com/gocraft/web"

	"github.com/18F/cg-dashboard/helpers"
)

// CreateRouter sets up the router (and subrouters).
// It also includes the closure middleware where we load the global Settings reference into each request.
// Should only be called once, and normally called by Serve(). It's only public for the tests
func (s *Settings) CreateRouter() (*web.Router, error) {
	// Cache templates
	templates, err := helpers.InitTemplates(s.BasePath)
	if err != nil {
		return nil, err
	}

	router := web.New(DashboardContext{})

	// A closure that effectively loads the Settings into every request.
	router.Middleware(func(c *DashboardContext, resp web.ResponseWriter, req *web.Request, next web.NextMiddlewareFunc) {
		c.Settings = s
		c.templates = templates
		c.mailer = s.EmailSender
		next(resp, req)
	})

	// Looks for an OAuth token in the session and load into context
	router.Middleware((*DashboardContext).LoadSession)

	// Frontend Route Initialization
	// Set up static file serving to load from the static folder.
	router.Middleware(StaticMiddleware("static"))

	router.Get("/", (*DashboardContext).Index)

	// Backend Route Initialization
	// Initialize the Gocraft Router with the basic context and routes
	router.Get("/ping", (*DashboardContext).Ping)
	router.Get("/handshake", (*DashboardContext).LoginHandshake)
	router.Get("/oauth2callback", (*DashboardContext).OAuthCallback)
	router.Get("/logout", (*DashboardContext).Logout)

	// While the above can be accessed with no authentication, for the
	// following authentication is required
	secureRouter := router.Subrouter(SecureContext{}, "/")

	// Add auth middleware
	secureRouter.Middleware((*SecureContext).LoginRequired)

	// Setup the /api subrouter.
	apiRouter := secureRouter.Subrouter(APIContext{}, "/v2")

	// All routes accepted
	apiRouter.Get("/authstatus", (*APIContext).AuthStatus)
	apiRouter.Get("/profile", (*APIContext).UserProfile)
	apiRouter.Get("/:*", (*APIContext).APIProxy)
	apiRouter.Put("/:*", (*APIContext).APIProxy)
	apiRouter.Post("/:*", (*APIContext).APIProxy)
	apiRouter.Delete("/:*", (*APIContext).APIProxy)

	// Setup the /uaa subrouter.
	uaaRouter := secureRouter.Subrouter(UAAContext{}, "/uaa")
	uaaRouter.Get("/userinfo", (*UAAContext).UserInfo)
	uaaRouter.Get("/uaainfo", (*UAAContext).UaaInfo)
	uaaRouter.Post("/invite/users", (*UAAContext).InviteUserToOrg)

	// Setup the /log subrouter.
	logRouter := secureRouter.Subrouter(LogContext{}, "/log")
	logRouter.Get("/recent", (*LogContext).RecentLogs)

	return router, nil
}
