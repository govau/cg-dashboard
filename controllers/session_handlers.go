package controllers

import (
	"crypto/rand"
	"fmt"
	"io"
	"log"
	"net/url"
	"os"
	"time"

	"github.com/boj/redistore"
	"github.com/garyburd/redigo/redis"
	"github.com/gorilla/sessions"
)

// SessionHandler handlers sessions
type SessionHandler interface {
	// Type returns the name of the type of handler
	Type() string

	// CheckHealth returns true if the backend is healthy
	CheckHealth() bool

	// Store returns the session store
	Store() sessions.Store
}

// StoreWrapperHandler wraps an existing SessionStore
type StoreWrapperHandler struct {
	// TypeName to return
	TypeName string

	// SessionStore to wrap
	SessionStore sessions.Store

	// HealthChecker is optional, if not set assumes healthy
	HealthChecker func() bool
}

// Type returns the name of the type of handler
func (swh *StoreWrapperHandler) Type() string {
	return swh.TypeName
}

// CheckHealth returns true if the backend is healthy
func (swh *StoreWrapperHandler) CheckHealth() bool {
	if swh.HealthChecker == nil {
		return true
	}
	return swh.HealthChecker()
}

// Store returns the session store
func (swh *StoreWrapperHandler) Store() sessions.Store {
	return swh.SessionStore
}

// NewSecureCookieStore creates a new session store that simply signs and encrypts the data,
// leaving it to the client to store and send back.
func NewSecureCookieStore(secureOnly bool) SessionHandler {
	// TODO, accept these as input
	authKey := make([]byte, 64)
	encryptionKey := make([]byte, 32)

	_, err := io.ReadFull(rand.Reader, authKey)
	if err != nil {
		fmt.Println("unable to read random numbers")
		os.Exit(1)
	}
	_, err = io.ReadFull(rand.Reader, encryptionKey)
	if err != nil {
		fmt.Println("unable to read random numbers")
		os.Exit(1)
	}

	store := sessions.NewCookieStore(authKey, encryptionKey)
	store.Options.HttpOnly = true
	store.Options.Secure = secureOnly

	return &StoreWrapperHandler{
		TypeName:     "securecookie",
		SessionStore: store,
	}
}

// NewRedisCookieStore stores sessions in Redis.
func NewRedisCookieStore(uri string, sessionKey []byte, secureOnly bool) SessionHandler {
	u, err := url.Parse(uri)
	if err != nil {
		fmt.Println("unable to parse redis URL, exiting:", err)
		os.Exit(1)
	}

	password := ""
	if u.User != nil {
		password, _ = u.User.Password()
	}

	// Create a common redis pool of connections.
	redisPool := &redis.Pool{
		MaxIdle:     10,
		IdleTimeout: 240 * time.Second,
		TestOnBorrow: func(c redis.Conn, t time.Time) error {
			_, pingErr := c.Do("PING")
			return pingErr
		},
		Dial: func() (redis.Conn, error) {
			// We need to control how long connections are attempted.
			// Currently will limit how long redis should respond back to
			// 10 seconds. Any time less than the overall connection timeout of 60
			// seconds is good.
			c, dialErr := redis.Dial("tcp", u.Host,
				redis.DialConnectTimeout(10*time.Second),
				redis.DialWriteTimeout(10*time.Second),
				redis.DialReadTimeout(10*time.Second))
			if dialErr != nil {
				return nil, dialErr
			}
			if password != "" {
				if _, authErr := c.Do("AUTH", password); authErr != nil {
					c.Close()
					return nil, authErr
				}
			}
			return c, nil
		},
	}
	// create our redis pool.
	store, err := redistore.NewRediStoreWithPool(redisPool, sessionKey)
	if err != nil {
		fmt.Println("Unable to create redis store:", err)
		os.Exit(1)
	}
	store.SetMaxLength(4096 * 4)
	store.Options = &sessions.Options{
		HttpOnly: true,
		MaxAge:   60 * 60 * 24 * 7, // 7 days at most
		Path:     "/",
		Secure:   secureOnly,
	}

	return &StoreWrapperHandler{
		TypeName:     "redis",
		SessionStore: store,
		HealthChecker: func() bool {
			c := redisPool.Get()
			defer c.Close()
			_, err := c.Do("PING")
			if err != nil {
				log.Printf("{\"health-check-error\": \"%s\"}", err)
				return false
			}
			return true
		},
	}
}

// NewFilesystemCookieStore stores sessions on the file system
func NewFilesystemCookieStore(sessionKey []byte, secureOnly bool) SessionHandler {
	store := sessions.NewFilesystemStore("", sessionKey)
	store.MaxLength(4096 * 4)
	store.Options = &sessions.Options{
		HttpOnly: true,
		// TODO remove this; work-around for
		// https://github.com/gorilla/sessions/issues/96
		MaxAge: 60 * 60 * 24 * 7, // 7 days at most
		Path:   "/",
		Secure: secureOnly,
	}
	return &StoreWrapperHandler{
		TypeName:     "file",
		SessionStore: store,
	}
}
