package controllers

import (
	"net/http"
	"net/http/pprof"
	"strings"

	"github.com/gocraft/web"
)

// initPProfRouter adds the routes for PProf.
func initPProfRouter(parentRouter *web.Router) {
	// Setup the /pprof subrouter.
	pprofRouter := parentRouter.Subrouter(pprofContext{}, "/debug/pprof")
	pprofRouter.Get("/", (*pprofContext).Index)
	pprofRouter.Get("/heap", (*pprofContext).Heap)
	pprofRouter.Get("/goroutine", (*pprofContext).Goroutine)
	pprofRouter.Get("/threadcreate", (*pprofContext).Threadcreate)
	pprofRouter.Get("/block", (*pprofContext).Threadcreate)
	pprofRouter.Get("/profile", (*pprofContext).Profile)
	pprofRouter.Get("/symbol", (*pprofContext).Symbol)
}

// PProfContext is a debug context to profile information about the backend.
type pprofContext struct {
	*dashboardContext // Required.
}

// Index responds with the pprof-formatted profile named by the request.
func (c *pprofContext) Index(rw web.ResponseWriter, req *web.Request) {
	// PPROF will automatically make paths for you. Need to make sure that the index has a / at the end.
	if !strings.HasSuffix(req.URL.Path, "/") {
		http.Redirect(rw, req.Request, req.URL.Path+"/", http.StatusMovedPermanently)
		return
	}
	pprof.Index(rw, req.Request)
}

// Heap responds with the heap pprof-formatted profile. (Based off Index)
func (c *pprofContext) Heap(rw web.ResponseWriter, req *web.Request) {
	pprof.Handler("heap").ServeHTTP(rw, req.Request)
}

// Goroutine responds with the goroutine pprof-formatted profile. (Based off Index)
func (c *pprofContext) Goroutine(rw web.ResponseWriter, req *web.Request) {
	pprof.Handler("goroutine").ServeHTTP(rw, req.Request)
}

// Threadcreate responds with the threadcreate pprof-formatted profile. (Based off Index)
func (c *pprofContext) Threadcreate(rw web.ResponseWriter, req *web.Request) {
	pprof.Handler("threadcreate").ServeHTTP(rw, req.Request)
}

// Block responds with the the block pprof-formatted profile. (Based off Index)
func (c *pprofContext) Block(rw web.ResponseWriter, req *web.Request) {
	pprof.Handler("block").ServeHTTP(rw, req.Request)
}

// Profile responds with the cpu pprof-formatted profile.
func (c *pprofContext) Profile(rw web.ResponseWriter, req *web.Request) {
	pprof.Profile(rw, req.Request)
}

// Symbol looks up the program counters listed in the request,
// responding with a table mapping program counters to function names.
func (c *pprofContext) Symbol(rw web.ResponseWriter, req *web.Request) {
	pprof.Symbol(rw, req.Request)
}
