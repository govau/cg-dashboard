package controllers

import (
	"encoding/json"
	"log"
	"net/http"
	"runtime/debug"
)

var defaultErrorResponse = InternalServerErrorResponse

var fallbackErrorResponseBytes []byte

func init() {
	b, err := json.Marshal(defaultErrorResponse)
	if err != nil {
		panic(err)
	}
	fallbackErrorResponseBytes = b
}

type ErrorResponse struct {
	Error `json:"error"`
	// Err is the original error that caused this response to exist.
	Err error `json:"-"`
}

// WithErr saves err to r and is a record of the original error.
func (r ErrorResponse) WithErr(err error) ErrorResponse {
	r.Err = err
	return r
}

func writeErrorResponse(w http.ResponseWriter, r *http.Request, status int, resp ErrorResponse) {
	b, err := json.Marshal(resp)
	if err != nil {
		log.Printf("could not marshal JSON error response: %s", err.Error())
		status = http.StatusInternalServerError
		b = fallbackErrorResponseBytes
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	w.Write(b)
}

type Error struct {
	Code    string `json:"code"`
	Message string `json:"message,omitempty"`
}

var BadRequestResponse = ErrorResponse{
	Error: Error{
		Code:    "badRequest",
		Message: "Bad request.",
	},
}

var InternalServerErrorResponse = ErrorResponse{
	Error: Error{
		Code:    "internalServerError",
		Message: "Internal server error.",
	},
}

func NewInternalServerErrorResponse(message string) ErrorResponse {
	return ErrorResponse{
		Error: Error{
			Code:    "internalServerError",
			Message: message,
		},
	}
}

type ErrorWriter struct{}

func (ew ErrorWriter) HandleErr(w http.ResponseWriter, r *http.Request, err error) {
	var (
		status = http.StatusInternalServerError
		resp   = InternalServerErrorResponse
	)

	log.Println(err.Error())
	log.Printf("%s", debug.Stack())

	ew.write(w, r, status, resp, err)
}

func (ew ErrorWriter) Write(w http.ResponseWriter, r *http.Request, status int, resp ErrorResponse) {
	ew.write(w, r, status, resp, nil)
}

func (ew ErrorWriter) WriteBadRequest(w http.ResponseWriter, r *http.Request) {
	ew.write(w, r, http.StatusBadRequest, BadRequestResponse, nil)
}

func (ew ErrorWriter) WriteBadRequestErr(w http.ResponseWriter, r *http.Request, err error) {
	status := http.StatusBadRequest
	resp := BadRequestResponse.WithErr(err)
	ew.write(w, r, status, resp, err)
}

func (ew ErrorWriter) write(w http.ResponseWriter, r *http.Request, status int, resp ErrorResponse, originalErr error) {
	writeErrorResponse(w, r, status, resp)
}
