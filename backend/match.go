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
type MatchesHandler struct{}

func (m MatchesHandler) GetMatches(w http.ResponseWriter, r *http.Request) {
	baseCity := r.URL.Query().Get("baseCity")
	fmt.Println(baseCity)
	result, err := getLocalCoordinates(baseCity)
	if err != nil {
		http.Error(w, "Error getting matches for city", http.StatusInternalServerError)
	}
	if err := json.NewEncoder(w).Encode(result); err != nil {
		http.Error(w, "Error encoding", http.StatusInternalServerError)
		return
	}
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
	fmt.Println(fullUrl)
	resp, err := http.Get(fullUrl)
	if err != nil {
		fmt.Println("Request failed:", err)
		return nil, err
	}
	defer resp.Body.Close()

	// Check if the status code is not OK
	if resp.StatusCode != http.StatusOK {
		errMsg := fmt.Sprintf("Request failed with status: %d - %s", resp.StatusCode, http.StatusText(resp.StatusCode))
		fmt.Println(errMsg)
		return nil, fmt.Errorf(errMsg) // Return a custom error
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Failed to read json,", err)
		return nil, err

	}

	var result OpencageResponse
	if err := json.Unmarshal(body, &result); err != nil {
		fmt.Println("Failed to unmarshal,", err)
		return nil, err
	}
	return &result, nil
}
