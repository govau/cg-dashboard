package helpers

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"os"

	"github.com/cloudfoundry-community/go-cfenv"
)

// EnvLookup will return the value and whether it was found or not
type EnvLookup func(name string) (string, bool)

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

	// StdRandStateGenerator will return an appopriate state generator
	StdRandStateGenerator = func() (string, error) {
		b := make([]byte, 32)
		_, err := rand.Read(b)
		if err != nil {
			return "", err
		}
		return base64.URLEncoding.EncodeToString(b), err
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

// EnvLoader will return the value or default if not found
type EnvLoader func(name, defaulVal string) string

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
