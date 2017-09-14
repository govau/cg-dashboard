package helpers

import (
	"errors"
	"fmt"
	"net/url"
	"os"

	"github.com/cloudfoundry-community/go-cfenv"
)

// MustGetRedisSettings returns address, password for redis, as determined by looking up:
// 1. os.Getenv for REDIS_URI
// 2. VCAP tagged service
// 3. Default to localhost
// If bad value, will fatally exit
func MustGetRedisSettings(env *cfenv.App) (string, string) {
	// Try to read directly from REDIS_URI first.
	uri := os.Getenv("REDIS_URI")
	if uri == "" {
		// If no direct REDIS_URI, parse VCAP_SERVICES
		// ignore failure, we'll get an empty string which we default below
		uri, _ = getRedisService(env)
	}
	// If nothing worked so far, default to localhost
	if uri == "" {
		uri = "redis://localhost:6379"
	}

	u, err := url.Parse(uri)
	if err != nil {
		fmt.Println("unable to parse redis URL, exiting:", err)
		os.Exit(1)
	}

	password := ""
	if u.User != nil {
		password, _ = u.User.Password()
	}

	return u.Host, password
}

func getRedisService(env *cfenv.App) (string, error) {
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
