package main

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		_, err := w.Write([]byte("OK"))
		if err != nil {
			log.Println("Writing resp. failed: ", err)
		}
	})
	r.Mount("/matches", MatchesRoutes())
	log.Fatal(http.ListenAndServe(":8080", r))
}

func MatchesRoutes() chi.Router {
	r := chi.NewRouter()
	matchesHandler := MatchesHandler{}
	r.Get("/", matchesHandler.GetMatches)

	return r
}
