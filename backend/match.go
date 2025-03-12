package main

import "net/http"

// create a struct we attach some methods to as the route handlers
type MatchHandler struct{}

func (m MatchHandler) GetMatches(w http.ResponseWriter, r *http.Request) {
}
