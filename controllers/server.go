package controllers

import (
	"context"
	"crypto/tls"
	"errors"
	"fmt"
	"net/http"

	"github.com/18F/cg-dashboard/helpers"
	"github.com/18F/cg-dashboard/mailer"
	"github.com/gorilla/csrf"
	"github.com/yvasiyarov/gorelic"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/clientcredentials"

	gorillacontext "github.com/gorilla/context"
)

// Settings is the object to hold global values and objects for the service.
type Settings struct {
	// OAuthConfig is the OAuth client with all the parameters to talk with CF's UAA OAuth Provider.
	OAuthConfig *oauth2.Config
	// Console API
	ConsoleAPI string
	// Login URL - used to redirect users to the logout page
	LoginURL string
	// Sessions is the session store for all connected users.
	Sessions SessionHandler
	// Generate secure random state
	StateGenerator func() (string, error)
	// UAA API
	UaaURL string
	// Log API
	LogURL string
	// Path to root of project.
	BasePath string
	// High Privileged OauthConfig
	HighPrivilegedOauthConfig *clientcredentials.Config
	// A flag to indicate whether profiling should be included (debug purposes).
	PProfEnabled bool
	// Build Info
	BuildInfo string
	// Set the secure flag on session cookies
	SecureCookies bool
	// Inidicates if targeting a local CF environment.
	LocalCF bool
	// URL where this app is hosted
	AppURL string

	EmailSender mailer.Mailer

	// Shared secret with CF API proxy
	TICSecret string

	// NewRelicLicense license key for NewRelic - optional
	NewRelicLicense string

	// CSRFKey passed to Gorilla CSRF.
	CSRFKey []byte

	// ListAddr is the host/port we'll listen on
	ListenAddr string
}

func (s *Settings) startNewRelicMonitoring() {
	fmt.Println("starting monitoring...")
	agent := gorelic.NewAgent()
	agent.Verbose = true
	agent.CollectHTTPStat = true
	agent.NewrelicLicense = s.NewRelicLicense
	agent.NewrelicName = "Cloudgov Deck"
	if err := agent.Run(); err != nil {
		fmt.Println(err.Error())
	}
}

// Serve starts the server and runs forever.
// This is the only method that should be called after creation.
func (s *Settings) Serve() error {
	// Validate some basics
	// Safe guard: shouldn't run with insecure cookies if we are
	// in a non-development environment (i.e. production)
	if !s.LocalCF && !s.SecureCookies {
		return errors.New("cannot run with insecure cookies when targeting a production CF environment")
	}

	// Initialize the router
	router, err := s.CreateRouter()
	if err != nil {
		return err
	}

	if s.PProfEnabled {
		initPProfRouter(router)
	}

	if s.NewRelicLicense == "" {
		s.startNewRelicMonitoring()
	}

	fmt.Println("starting app now...")

	// TODO add better timeout message. By default it will just say "Timeout"
	return http.ListenAndServe(s.ListenAddr, csrf.Protect(s.CSRFKey, csrf.Secure(s.SecureCookies))(
		http.TimeoutHandler(gorillacontext.ClearHandler(router), helpers.TimeoutConstant, ""),
	))
}

// CreateContext returns a new context to be used for http connections.
func (s *Settings) CreateContext() context.Context {
	ctx := context.TODO()
	// If targeting local cf env, we won't have
	// valid SSL certs so we need to disable verifying them.
	if s.LocalCF {
		httpClient := http.DefaultClient
		httpClient.Transport = &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		}
		ctx = context.WithValue(ctx, oauth2.HTTPClient, httpClient)
	}
	return ctx
}
