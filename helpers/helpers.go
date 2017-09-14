package helpers

import (
	"encoding/gob"
	"time"

	"golang.org/x/oauth2"
)

func init() {
	// Want to save a struct into the session. Have to register it.
	gob.Register(oauth2.Token{})
}

// TimeoutConstant is a constant which holds how long any incoming request should wait until we timeout.
// This is useful as some calls from the Go backend to the external API may take a long time.
// If the user decides to refresh or if the client is polling, multiple requests might build up. This timecaps them.
var TimeoutConstant = time.Second * 20
