package main

import (
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

func main() {
	// Load CloudFoundry environment data, if we have it
	cfApp, err := cfenv.Current()
	if err != nil {
		fmt.Println("Warning: No Cloud Foundry Environment found, will not be used for sourcing env variables")
	}

	// Poke in variables here to fallback to where bits aren't in the normal palce
	additionalFallbacks := make(map[string]string)

	// e.g. find look for a service binding for Redis
	redisURI, err := helpers.GetRedisService(cfApp)
	if err == nil {
		additionalFallbacks["REDIS_URI"] = redisURI
	}

	// Create app, serve forever...
	log.Fatal(createSettingsFromEnv(helpers.CreateEnvVarLoader([]helpers.EnvLookup{
		os.LookupEnv, // check environment first
		helpers.CreateEnvFromCFNamedService(cfApp, "dashboard-ups"), // fallback to CUPS
		helpers.MapEnvLookup(additionalFallbacks),
	})).Serve())
}

func createSettingsFromEnv(envGet helpers.EnvLoader) *controllers.Settings {
	// Configure the application
	return &controllers.Settings{
		OAuthConfig: &oauth2.Config{
			ClientID:     helpers.MustGet(envGet, helpers.ClientIDEnvVar),
			ClientSecret: helpers.MustGet(envGet, helpers.ClientSecretEnvVar),
			RedirectURL:  helpers.MustGet(envGet, helpers.HostnameEnvVar) + "/oauth2callback",
			Scopes: []string{
				"cloud_controller.read",
				"cloud_controller.write",
				"cloud_controller.admin",
				"scim.read",
				"openid",
			},
			Endpoint: oauth2.Endpoint{
				AuthURL:  helpers.MustGet(envGet, helpers.LoginURLEnvVar) + "/oauth/authorize",
				TokenURL: helpers.MustGet(envGet, helpers.UAAURLEnvVar) + "/oauth/token",
			},
		},
		ConsoleAPI: helpers.MustGet(envGet, helpers.APIURLEnvVar),
		LoginURL:   helpers.MustGet(envGet, helpers.LoginURLEnvVar),
		Sessions: func() controllers.SessionHandler {
			switch envGet(helpers.SessionBackendEnvVar, "file") {
			case "securecookie":
				return controllers.NewSecureCookieStore(helpers.BoolGet(envGet, helpers.SecureCookiesEnvVar))
			case "redis":
				return controllers.NewRedisCookieStore(
					envGet("REDIS_URI", "redis://localhost:6379"),
					[]byte(helpers.MustGet(envGet, helpers.SessionKeyEnvVar)),
					helpers.BoolGet(envGet, helpers.SecureCookiesEnvVar),
				)
			case "file":
				return controllers.NewFilesystemCookieStore(
					[]byte(helpers.MustGet(envGet, helpers.SessionKeyEnvVar)),
					helpers.BoolGet(envGet, helpers.SecureCookiesEnvVar),
				)
			default:
				log.Fatal("unknown session backend")
				return nil // will never reach
			}
		}(),
		StateGenerator: helpers.StdRandStateGenerator,
		UaaURL:         helpers.MustGet(envGet, helpers.UAAURLEnvVar),
		LogURL:         helpers.MustGet(envGet, helpers.LogURLEnvVar),
		BasePath:       envGet(helpers.BasePathEnvVar, ""),
		HighPrivilegedOauthConfig: &clientcredentials.Config{
			ClientID:     helpers.MustGet(envGet, helpers.ClientIDEnvVar),
			ClientSecret: helpers.MustGet(envGet, helpers.ClientSecretEnvVar),
			Scopes: []string{
				"scim.invite",
				"cloud_controller.admin",
				"scim.read",
			},
			TokenURL: helpers.MustGet(envGet, helpers.UAAURLEnvVar) + "/oauth/token",
		},
		PProfEnabled:  helpers.BoolGet(envGet, helpers.PProfEnabledEnvVar),
		BuildInfo:     envGet(helpers.BuildInfoEnvVar, "developer-build"),
		SecureCookies: helpers.BoolGet(envGet, helpers.SecureCookiesEnvVar),
		LocalCF:       helpers.BoolGet(envGet, helpers.LocalCFEnvVar),
		AppURL:        helpers.MustGet(envGet, helpers.HostnameEnvVar),

		EmailSender: &mailer.SMTPMailer{
			Host:     helpers.MustGet(envGet, helpers.SMTPHostEnvVar),
			Port:     envGet(helpers.SMTPPortEnvVar, ""),
			Username: envGet(helpers.SMTPUserEnvVar, ""),
			Password: envGet(helpers.SMTPPortEnvVar, ""),
			From:     helpers.MustGet(envGet, helpers.SMTPFromEnvVar),
		},

		TICSecret: envGet(helpers.TICSecretEnvVar, ""),

		NewRelicLicense: envGet(helpers.NewRelicLicenseEnvVar, ""),
		CSRFKey:         []byte(helpers.MustGet(envGet, helpers.SessionKeyEnvVar)),

		ListenAddr: ":" + envGet("PORT", "9999"),
	}
}
