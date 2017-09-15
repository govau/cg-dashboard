package helpers

import (
	"crypto/rand"
	"encoding/base64"
	"time"
)

// TimeoutConstant is a constant which holds how long any incoming request should wait until we timeout.
// This is useful as some calls from the Go backend to the external API may take a long time.
// If the user decides to refresh or if the client is polling, multiple requests might build up. This timecaps them.
var TimeoutConstant = time.Second * 20

// GenerateRandomString will return an appopriate state generator
func GenerateRandomString() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}
