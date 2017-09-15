package helpers

import (
	"errors"
	"fmt"
	"io"
	"os"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/clientcredentials"

	"github.com/18F/cg-dashboard/mailer"
	"github.com/cloudfoundry-community/go-cfenv"
	"github.com/gorilla/sessions"
)

// SessionHandler handles sessions
type SessionHandler interface {
	// Type returns the name of the type of handler
	Type() string

	// CheckHealth returns true if the backend is healthy
	CheckHealth() bool

	// Store returns the session store
	Store() sessions.Store
}

// TemplateManager
type TemplateManager interface {
	GetInviteEmail(rw io.Writer, url string) error
	GetIndex(rw io.Writer, csrfToken, gaTrackingID, newRelicID, newRelicBrowserLicenseKey string) error
}

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
	Templater TemplateManager
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

// EnvLookup will return the value and whether it was found or not
type EnvLookup func(name string) (string, bool)

// EnvLoader will return the value or default if not found
type EnvLoader func(name, defaulVal string) string

// MapEnvLookup creates a lookup based on a map
func MapEnvLookup(m map[string]string) EnvLookup {
	return func(name string) (string, bool) {
		rv, found := m[name]
		return rv, found
	}
}

var (
	noopLookup = func(string) (string, bool) {
		return "", false
	}
)

// MustGet will print a message with the name in it and call os.Exit(1) if value is not set.
// else it will return value.
func MustGet(loader EnvLoader, name string) string {
	rv := loader(name, "")
	if rv == "" {
		fmt.Printf("Unable to find '%s' in environment. Exiting.\n", name)
		os.Exit(1)
	}
	return rv
}

// BoolGet returns true iff the loader is set to the strings "true" or "1"
func BoolGet(loader EnvLoader, name string) bool {
	val := loader(name, "false")
	return val == "true" || val == "1"
}

// CreateEnvFromCFNamedService looks for a CloudFoundry bound service
// with the passed name, and will allow sourcing of environment variables
// from there
func CreateEnvFromCFNamedService(cfApp *cfenv.App, namedService string) EnvLookup {
	service, err := cfApp.Services.WithName(namedService)
	if err != nil {
		fmt.Printf("Warning: No bound service found with name: %s, will not be used for sourcing env variables\n", namedService)
		return noopLookup
	}

	return func(name string) (string, bool) {
		serviceVar, found := service.Credentials[name]
		if !found {
			return "", false
		}
		serviceVarAsString, ok := serviceVar.(string)
		if !ok {
			fmt.Printf("Warning: variable found in service for %s, but unable to cast as string, so ignoring\n", name)
			return "", false
		}
		return serviceVarAsString, true
	}
}

// CreateEnvVarLoader will search a path of environment sources until it finds a value
func CreateEnvVarLoader(path []EnvLookup) EnvLoader {
	return func(name, defaulVal string) string {
		for _, env := range path {
			rv, found := env(name)
			if found {
				return rv
			}
		}
		return defaulVal
	}
}

// GetRedisService looks for a URI in the cf env
func GetRedisService(env *cfenv.App) (string, error) {
	if env == nil {
		return "", errors.New("Empty Cloud Foundry environment")
	}
	services, err := env.Services.WithTag("redis")
	if err != nil {
		return "", err
	}
	if len(services) == 0 {
		return "", errors.New(`Could not find service with tag "redis"`)
	}
	uri, ok := services[0].Credentials["uri"].(string)
	if !ok {
		if uri, err = getRedisURIFromParts(services[0]); err == nil {
			return uri, nil
		}
		return "", errors.New("Could not parse redis uri")
	}
	return uri, nil
}

// TODO: Delete after east-west is retired
func getRedisURIFromParts(service cfenv.Service) (string, error) {
	host, ok := service.Credentials["hostname"].(string)
	if !ok {
		return "", errors.New(`Could not find "host" key`)
	}

	port, ok := service.Credentials["port"].(string)
	if !ok {
		return "", errors.New(`Could not find "port" key`)
	}

	password, ok := service.Credentials["password"].(string)
	if !ok {
		return "", errors.New(`Could not find "password" key`)
	}

	return fmt.Sprintf("redis://:%s@%s:%s", password, host, port), nil
}
