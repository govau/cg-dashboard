package main

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"log"
	"os"

	"github.com/18F/cg-dashboard/controllers"
	"github.com/18F/cg-dashboard/mailer"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/clientcredentials"

	cfenv "github.com/cloudfoundry-community/go-cfenv"

	"github.com/18F/cg-dashboard/helpers"
)

const (
	defaultPort           = "9999"
	cfUserProvidedService = "dashboard-ups"
)

type envLookup func(name string) (string, bool)

var (
	noopLookup = func(string) (string, bool) {
		return "", false
	}
	stdRandStateGenerator = func() (string, error) {
		b := make([]byte, 32)
		_, err := rand.Read(b)
		if err != nil {
			return "", err
		}
		return base64.URLEncoding.EncodeToString(b), err
	}
)

// mustGet will print a message with the name in it and call os.Exit(1) if value is not set.
// else it will return value.
func mustGet(loader envLoader, name string) string {
	rv := loader(name, "")
	if rv == "" {
		fmt.Printf("Unable to find '%s' in environment. Exiting.\n", name)
		os.Exit(1)
	}
	return rv
}

// boolGet returns true iff the loader is set to the strings "true" or "1"
func boolGet(loader envLoader, name string) bool {
	val := loader(name, "false")
	return val == "true" || val == "1"
}

// createEnvFromNamedService looks for a CloudFoundry bound service
// with the passed name, and will allow sourcing of environment variables
// from there
func createEnvFromCFNamedService(cfApp *cfenv.App, namedService string) envLookup {
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

type envLoader func(name, defaulVal string) string

func createEnvVarLoader(path []envLookup) envLoader {
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

func main() {
	// Load the cf app data
	cfApp, err := cfenv.Current()
	if err != nil {
		fmt.Println("Warning: No Cloud Foundry Environment found, will not be used for sourcing env variables")
	}

	// This defines the path by which we look for environment variables
	envGet := createEnvVarLoader([]envLookup{
		os.LookupEnv, // check environment first
		createEnvFromCFNamedService(cfApp, cfUserProvidedService), // fallback to CUPS
	})

	// Configure the application
	app := &controllers.Settings{
		OAuthConfig: &oauth2.Config{
			ClientID:     mustGet(envGet, helpers.ClientIDEnvVar),
			ClientSecret: mustGet(envGet, helpers.ClientSecretEnvVar),
			RedirectURL:  mustGet(envGet, helpers.HostnameEnvVar) + "/oauth2callback",
			Scopes:       []string{"cloud_controller.read", "cloud_controller.write", "cloud_controller.admin", "scim.read", "openid"},
			Endpoint: oauth2.Endpoint{
				AuthURL:  mustGet(envGet, helpers.LoginURLEnvVar) + "/oauth/authorize",
				TokenURL: mustGet(envGet, helpers.UAAURLEnvVar) + "/oauth/token",
			},
		},
		ConsoleAPI: mustGet(envGet, helpers.APIURLEnvVar),
		LoginURL:   mustGet(envGet, helpers.LoginURLEnvVar),
		Sessions: func() controllers.SessionHandler {
			switch envGet(helpers.SessionBackendEnvVar, "file") {
			case "securecookie":
				return controllers.NewSecureCookieStore(boolGet(envGet, helpers.SecureCookiesEnvVar))
			case "redis":
				address, password := helpers.MustGetRedisSettings(cfApp)
				return controllers.NewRedisCookieStore(
					address, password,
					[]byte(mustGet(envGet, helpers.SessionKeyEnvVar)),
					boolGet(envGet, helpers.SecureCookiesEnvVar),
				)
			case "file":
				return controllers.NewFilesystemCookieStore(
					[]byte(mustGet(envGet, helpers.SessionKeyEnvVar)),
					boolGet(envGet, helpers.SecureCookiesEnvVar),
				)
			default:
				log.Fatal("unknown session backend")
				return nil // will never reach
			}
		}(),
		StateGenerator: stdRandStateGenerator,
		UaaURL:         mustGet(envGet, helpers.UAAURLEnvVar),
		LogURL:         mustGet(envGet, helpers.LogURLEnvVar),
		BasePath:       envGet(helpers.BasePathEnvVar, ""),
		HighPrivilegedOauthConfig: &clientcredentials.Config{
			ClientID:     mustGet(envGet, helpers.ClientIDEnvVar),
			ClientSecret: mustGet(envGet, helpers.ClientSecretEnvVar),
			Scopes:       []string{"scim.invite", "cloud_controller.admin", "scim.read"},
			TokenURL:     mustGet(envGet, helpers.UAAURLEnvVar) + "/oauth/token",
		},
		PProfEnabled:  boolGet(envGet, helpers.PProfEnabledEnvVar),
		BuildInfo:     envGet(helpers.BuildInfoEnvVar, "developer-build"),
		SecureCookies: boolGet(envGet, helpers.SecureCookiesEnvVar),
		LocalCF:       boolGet(envGet, helpers.LocalCFEnvVar),
		AppURL:        mustGet(envGet, helpers.HostnameEnvVar),

		EmailSender: &mailer.SMTPMailer{
			Host:     mustGet(envGet, helpers.SMTPHostEnvVar),
			Port:     envGet(helpers.SMTPPortEnvVar, ""),
			Username: envGet(helpers.SMTPUserEnvVar, ""),
			Password: envGet(helpers.SMTPPortEnvVar, ""),
			From:     mustGet(envGet, helpers.SMTPFromEnvVar),
		},

		TICSecret: envGet(helpers.TICSecretEnvVar, ""),

		NewRelicLicense: envGet(helpers.NewRelicLicenseEnvVar, ""),
		CSRFKey:         []byte(mustGet(envGet, helpers.SessionKeyEnvVar)),

		ListenAddr: ":" + envGet("PORT", defaultPort),
	}

	// Up and away
	log.Fatal(app.Serve())
}
