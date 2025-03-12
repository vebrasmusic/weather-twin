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
	r.Mount("/match", MatchRoutes())
	log.Fatal(http.ListenAndServe(":8080", r))
}

func MatchRoutes() chi.Router {
	r := chi.NewRouter()
	matchHandler := MatchHandler{}
	r.Get("/", matchHandler.GetMatches)

	return r
}
