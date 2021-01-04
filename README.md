# news-benchmark

https://thomaspuppe.github.io/news-benchmark/

## Usage

* `npm run collect` to collect lighthouse data
* `npm run render` to render results into HTML file
* `npm run deploy` to copy the HTML file into gh_pages branch and push to GitHub


## Next Steps

* Run via GitHub Actions (like Speedlify)

* make rponline, FAZ and heise work

```

	{
		"id": "rponline",
		"url": "https://rp-online.de/",
		"label": "RP Online",
		"label_pretty": "RP Online"
	},
	{
		"id": "heise",
		"url": "https://www.heise.de/",
		"label": "heise",
		"label_pretty": "heise online"
	},
	{
		"id": "faz",
		"url": "https://www.faz.net/aktuell/",
		"label": "FAZ",
		"label_pretty": "FAZ"
	}
```

* small ranking boards for each category (a11y, best-practice, perf, seo), or a sortable table
