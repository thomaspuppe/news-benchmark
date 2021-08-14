require('dotenv').config();
const fs = require('fs')
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');


const SITES = JSON.parse(fs.readFileSync('./sites.json'), 'utf8');

async function launchChromeAndRunLighthouse(siteConfig, opts) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless'],
    extraHeaders: "{\"Cookie\":\"iom_consent=123\", \"_sp_v1_consent\":\"1!0:-1:-1:-1:-1:-1\", \"consentUUID\":\"123\"}"
  })
  opts.port = chrome.port;
  const runnerResult = await lighthouse(siteConfig.url, opts);
  await chrome.kill();
  return runnerResult;
}

const opts = {
  emulatedUserAgent: 'Chrome-Lighthouse',
  output: 'html'
};

if(process?.env?.PAGE_SPEED_INSIGHTS_API_KEY) {
    opts['plugins'] = [ 'lighthouse-plugin-field-performance' ];
    opts['settings'] = { psiToken: process.env.PAGE_SPEED_INSIGHTS_API_KEY };
    console.log('Run Lighthouse with Page Speed Insights')
}

collectLighthouseResults = index => {
    const SITE = SITES[index]
    console.log(SITE.url)
    launchChromeAndRunLighthouse(SITE, opts).then(results => {
        fs.writeFileSync(`./output/report_${SITE.id}.html`, results.report)
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
