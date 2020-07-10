const fs = require('fs')
const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const request = require('request-promise-native');
const {
  handleSpiegelConsent,
  handleZeitConsent
} = require('puppeteer-give-consent');

const SITES = JSON.parse(fs.readFileSync('./sites.json'), 'utf8');

const CONSENT_FUNCTIONS = {
  spiegel: handleSpiegelConsent,
  zeit: handleZeitConsent
};

async function giveConsent(browser, siteConfig) {
  const consentFunction = CONSENT_FUNCTIONS[siteConfig.id];
  const page = await browser.newPage();
  await page.goto(siteConfig.url);
  await consentFunction(page);
  await page.close();
  return;
}

async function launchChromeAndRunLighthouse(siteConfig, opts, config = null) {
  const chrome = await chromeLauncher.launch({chromeFlags: opts.chromeFlags})
  opts.port = chrome.port;

  // connect puppeteer to chrome (see https://github.com/GoogleChrome/lighthouse/blob/master/docs/puppeteer.md)
  const chromeStatsResponse = await request(`http://localhost:${opts.port}/json/version`);
  const { webSocketDebuggerUrl } = JSON.parse(chromeStatsResponse);
  const browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl });
  
  // handle sites with prerolled consent pages
  if (siteConfig.requires_consent) {
    await giveConsent(browser, siteConfig);
  }

  // run lighthouse
  const { lhr } = await lighthouse(siteConfig.url, opts, config);
  await chrome.kill();
  return lhr;
}

const opts = {
  chromeFlags: ['--headless'],
  plugins: ['lighthouse-plugin-field-performance']
};

collectLighthouseResults = index => {
    const SITE = SITES[index]
    console.log(SITE.url)
    launchChromeAndRunLighthouse(SITE, opts).then(results => {
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
