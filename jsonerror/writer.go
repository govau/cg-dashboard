package jsonerror

import (
	"encoding/json"
	"net/http"
	"runtime/debug"
)

type Logger interface {
	Log(args ...interface{})
	Logf(format string, args ...interface{})
}

type Writer struct {
	logger Logger
}

func NewLogWriter(logger Logger) *Writer {
	return &Writer{
		logger: logger,
	}
}

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
