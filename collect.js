const fs = require('fs')
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const SITES = JSON.parse(fs.readFileSync('./sites.json'), 'utf8')

function launchChromeAndRunLighthouse(url, opts, config = null) {
  return chromeLauncher.launch({chromeFlags: opts.chromeFlags}).then(chrome => {
    opts.port = chrome.port;
    return lighthouse(url, opts, config).then(results => {
      // use results.lhr for the JS-consumeable output
      // https://github.com/GoogleChrome/lighthouse/blob/master/types/lhr.d.ts
      // use results.report for the HTML/JSON/CSV output as a string
      // use results.artifacts for the trace/screenshots/other specific case you need (rarer)
      return chrome.kill().then(() => results.lhr)
    });
  });
}

const opts = {
  chromeFlags: ['--headless']
};

collectLighthouseResults = index => {
    const SITE = SITES[index]
    console.log(SITE.url)
    launchChromeAndRunLighthouse(SITE.url, opts).then(results => {
        fs.writeFileSync(`./results/${SITE.id}_latest.json`, JSON.stringify(results, null, 4))
    }).catch( error => {
        console.error(error)
    }).finally( foo => {
        if (index >= SITES.length-1) {
        } else {
            collectLighthouseResults(index+1)
        }
    });
}

collectLighthouseResults(0)
