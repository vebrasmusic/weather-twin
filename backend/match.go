package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
)

// create a struct we attach some methods to as the route handlers
type MatchHandler struct{}

func (m MatchHandler) GetMatches(w http.ResponseWriter, r *http.Request) {
}

func getLocalCoordinates(baseCity string) (*OpencageResponse, error) {
	opencageApiKey := os.Getenv("OPENCAGE_API_KEY")
	baseUrl := "https://api.opencagedata.com/geocode/v1/json"

	params := url.Values{}
	params.Add("q", baseCity)
	params.Add("key", opencageApiKey)
	params.Add("limit", "1")
	params.Add("countrycode", "US")

	fullUrl := fmt.Sprintf("%s?%s", baseUrl, params.Encode())

	resp, err := http.Get(fullUrl)
	if err != nil {
		fmt.Println("Request failed:", err)
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var result OpencageResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}
	return &result, nil
}
