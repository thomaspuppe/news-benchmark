console.time('📊')
const fs = require('fs')
const lighthouseReportGenerator = require('./node_modules/lighthouse/lighthouse-core/report/report-generator');

const SITES = JSON.parse(fs.readFileSync('./sites.json'), 'utf8')

generateHtmlReportFromLighthouseResult = (resultJSON, name) => {
    const resultHtml = lighthouseReportGenerator.generateReportHtml(resultJSON);
    fs.writeFileSync(`./output/report_${name}.html`, resultHtml)
}

reduceLighthouseResult = wholeResult => {
    return {
        accessibilityScore: wholeResult.categories.accessibility.score,
        bestpracticesScore: wholeResult.categories['best-practices'].score,
        performanceScore: wholeResult.categories.performance.score,
        seoScore: wholeResult.categories.seo.score,
        overallScore: wholeResult.categories.accessibility.score + wholeResult.categories['best-practices'].score + wholeResult.categories.performance.score + wholeResult.categories.seo.score
    }
}

// returns the index
findLeader = sites => {
    return Object.keys(sites).reduce((a, b) => sites[a]['result']['overallScore'] > sites[b]['result']['overallScore'] ? a : b);
}

eval_template = (s, params) => {
  return Function(...Object.keys(params), "return " + s)
  (...Object.values(params)) // TOTO: remove??
}

SITES.forEach( SITE => {
    // OPTIMIZE: async all the fs read and write operations
    SITE.lighthouseResult = JSON.parse(fs.readFileSync(`./results/${SITE.id}_latest.json`), 'utf8');
    SITE.result = reduceLighthouseResult(SITE.lighthouseResult)

    generateHtmlReportFromLighthouseResult(SITE.lighthouseResult, SITE.id)
})

const LEADER = SITES[findLeader(SITES)]

const TEMPLATE_INDEX = fs.readFileSync('./template_index.html', {encoding: 'utf-8'})

const FETCH_TIME = SITES[0].lighthouseResult.fetchTime
const fetchtime = new Date(FETCH_TIME)
const RESULTS_META = {
    fetchtime_date: `${fetchtime.getDate()}.${fetchtime.getMonth()+1}.${fetchtime.getFullYear()}`,
    fetchtime_time: `${fetchtime.getHours()}:${fetchtime.getMinutes()}`
}

const RENDER_OBJECT = {
    sites: SITES,
    leader: LEADER,
    meta: RESULTS_META
}

const htmlIndex = eval_template(TEMPLATE_INDEX, RENDER_OBJECT)

fs.writeFileSync('./output/index.html', htmlIndex)

console.timeEnd('📊')
