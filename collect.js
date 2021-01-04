const fs = require('fs')
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const SITES = JSON.parse(fs.readFileSync('./sites.json'), 'utf8');

async function launchChromeAndRunLighthouse(siteConfig, opts) {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']})
  opts.port = chrome.port;
  const runnerResult = await lighthouse(siteConfig.url, opts);
  await chrome.kill();
  return runnerResult;
}

const opts = {
  emulatedUserAgent: 'Chrome-Lighthouse',
  output: 'html',
  plugins: ['lighthouse-plugin-field-performance']
};

collectLighthouseResults = index => {
    const SITE = SITES[index]
    console.log(SITE.url)
    launchChromeAndRunLighthouse(SITE, opts).then(results => {
        // fs.writeFileSync(`./results/${SITE.id}_latest.html`, results.report)
        fs.writeFileSync(`./results/${SITE.id}_latest.json`, JSON.stringify(results.lhr, null, 4))
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
