package controllers

import (
	"context"
	"crypto/tls"
	"errors"
	"fmt"
	"net/http"

	"github.com/18F/cg-dashboard/helpers"
	"github.com/gorilla/csrf"
	"github.com/yvasiyarov/gorelic"
	"golang.org/x/oauth2"

	gorillacontext "github.com/gorilla/context"
)

type dashboardApplication struct {
	Settings *helpers.Settings
}

type RunnableApplication interface {
	Serve() error
}

func CreateAppFromSettings(settings *helpers.Settings) RunnableApplication {
	return &dashboardApplication{
		Settings: settings,
	}
}

func startNewRelicMonitoring(license string) {
	fmt.Println("starting monitoring...")
	agent := gorelic.NewAgent()
	agent.Verbose = true
	agent.CollectHTTPStat = true
	agent.NewrelicLicense = license
	agent.NewrelicName = "Cloudgov Deck"
	if err := agent.Run(); err != nil {
		fmt.Println(err.Error())
	}
}

// Serve starts the server and runs forever.
// This is the only method that should be called after creation.
func (s *dashboardApplication) Serve() error {
	// Validate some basics
	// Safe guard: shouldn't run with insecure cookies if we are
	// in a non-development environment (i.e. production)
	if !s.Settings.LocalCF && !s.Settings.SecureCookies {
		return errors.New("cannot run with insecure cookies when targeting a production CF environment")
	}

	// Initialize the router
	router, err := s.CreateRouter()
	if err != nil {
		return err
	}

	if s.Settings.PProfEnabled {
		initPProfRouter(router)
	}

	if s.Settings.NewRelicLicense != "" {
		startNewRelicMonitoring(s.Settings.NewRelicLicense)
	}

	fmt.Println("starting app now...")

	// TODO add better timeout message. By default it will just say "Timeout"
	return http.ListenAndServe(s.Settings.ListenAddr, csrf.Protect(s.Settings.CSRFKey, csrf.Secure(s.Settings.SecureCookies))(
		http.TimeoutHandler(gorillacontext.ClearHandler(router), helpers.TimeoutConstant, ""),
	))
}

// CreateContext returns a new context to be used for http connections.
func (s *dashboardApplication) CreateOAuth2Context() context.Context {
	ctx := context.TODO()
	// If targeting local cf env, we won't have
	// valid SSL certs so we need to disable verifying them.
	if s.Settings.LocalCF {
		httpClient := http.DefaultClient
		httpClient.Transport = &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		}
		ctx = context.WithValue(ctx, oauth2.HTTPClient, httpClient)
	}
	return ctx
}

func (s *dashboardApplication) CreatePrivilegedApplicationOAuthClient() *http.Client {
	return s.Settings.HighPrivilegedOauthConfig.Client(s.CreateOAuth2Context())
}

func (s *dashboardApplication) CreateUserOAuthClient(t *oauth2.Token) *http.Client {
	return s.Settings.OAuthConfig.Client(s.CreateOAuth2Context(), t)
}
