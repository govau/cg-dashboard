package jsonerror

import (
	"encoding/json"
	"net/http"
	"runtime/debug"
)

// Logger defines log methods for Writer.
type Logger interface {
	Log(args ...interface{})
	Logf(format string, args ...interface{})
}

// Writer is a type that writes errors to a HTTP response writer.
type Writer struct {
	logger Logger
}

// NewLogWriter makes a new Writer that uses the provided Logger.
func NewLogWriter(logger Logger) *Writer {
	return &Writer{
		logger: logger,
	}
}

// HandleErr is a generic method for handling any error.
// Use this method to handle an error with a type that has not already been
// special-cased.
func (ew Writer) HandleErr(w http.ResponseWriter, r *http.Request, err error) {
	var (
		status = http.StatusInternalServerError
		resp   = InternalServerErrorResponse
	)

	if ew.logger != nil {
		ew.logger.Log(err.Error())
		ew.logger.Logf("%s", debug.Stack())
	}

	ew.write(w, r, status, resp, err)
}

func (ew Writer) Write(w http.ResponseWriter, r *http.Request, status int, resp Response) {
	ew.write(w, r, status, resp, nil)
}

func (ew Writer) write(w http.ResponseWriter, r *http.Request, status int, resp Response, originalErr error) {
	b, err := json.Marshal(resp)
	if err != nil {
		if ew.logger != nil {
			ew.logger.Logf("could not marshal JSON error response: %s", err.Error())
		}
		status = http.StatusInternalServerError
		b = fallbackResponseBytes
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	w.Write(b)
}
