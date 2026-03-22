/*
Copyright © 2026 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"encoding/json"
	"fmt"
	"os"

	http "github.com/hieudoanm/frankfurter/src/libs/http"
	"github.com/spf13/cobra"
)

// FrankfurterResponse ...
type FrankfurterResponse struct {
	Amount float64            `json:"amount"`
	Base   string             `json:"base"`
	Date   string             `json:"date"`
	Rates  map[string]float64 `json:"rates"`
}

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "cc",
	Short: "Frankfurter CLI application (finance tools)",
	Long:  `The frankfurter CLI application is a comprehensive backend utility belonging to the finance suite of tools.

Use this root executable to manage configuring, running, and interacting with all frankfurter-related operations securely and efficiently from your terminal.`,
	Run: func(cmd *cobra.Command, args []string) {
		from, _ := cmd.Flags().GetString("from")
		to, _ := cmd.Flags().GetString("to")
		amount, _ := cmd.Flags().GetFloat64("amount")
		debug, _ := cmd.Flags().GetBool("debug")

		// Query Latest
		url := fmt.Sprintf("https://api.frankfurter.app/latest?base=%s&symbols=%s", from, to)
		query := map[string]string{}
		var options = http.Options{Query: query, Debug: debug}
		responseByte, getError := http.Get(url, options)
		if getError != nil {
			fmt.Println("Error: ", getError)
			return
		}

		// Parse response
		var response FrankfurterResponse
		jsonError := json.Unmarshal(responseByte, &response)
		if jsonError != nil {
			fmt.Println("Error: ", jsonError)
			return
		}

		rate, ok := response.Rates[to]
		if !ok {
			fmt.Printf("Error: no rate found for %s\n", to)
			return
		}

		converted := amount * rate
		fmt.Printf("%.2f %s = %.2f %s\n", amount, from, converted, to)
	},
}

func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {
	rootCmd.Flags().String("from", "EUR", "Source currency (default EUR)")
	rootCmd.Flags().String("to", "USD", "Target currency (default USD)")
	rootCmd.Flags().Float64("amount", 1, "Amount to convert (default 1)")
	rootCmd.Flags().Bool("debug", false, "Print response status and body")
}
