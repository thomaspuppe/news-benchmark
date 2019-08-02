console.time('📊')
const fs = require('fs')
const lighthouseReportGenerator = require('./node_modules/lighthouse/lighthouse-core/report/report-generator')

const SITES = JSON.parse(fs.readFileSync('./sites.json'), 'utf8')

generateHtmlReportFromLighthouseResult = (resultJSON, name) => {
    const resultHtml = lighthouseReportGenerator.generateReportHtml(resultJSON)
    fs.writeFileSync(`./output/report_${name}.html`, resultHtml)
}

addScoresToHistoryFile = (scores, name) => {
    let history = JSON.parse(fs.readFileSync('./results/history.json'), 'utf8')
    const today = new Date().toISOString().slice(0, 10)
    if ( !history[today] ) {
        history[today] = {}
    }
    history[today][name] = scores
    fs.writeFileSync('./results/history.json', JSON.stringify(history, null, 4))
}

reduceLighthouseResult = wholeResult => {
    return {
        accessibilityScore: wholeResult.categories.accessibility.score,
        bestpracticesScore: wholeResult.categories['best-practices'].score,
        performanceScore: wholeResult.categories.performance.score,
        fieldPerformanceScore: wholeResult.categories['lighthouse-plugin-field-performance'].score,
        seoScore: wholeResult.categories.seo.score,
        overallScore: wholeResult.categories.accessibility.score + wholeResult.categories['best-practices'].score + wholeResult.categories.performance.score + wholeResult.categories['lighthouse-plugin-field-performance'].score + wholeResult.categories.seo.score
    }
}

oneLeadingZero = value => {
    return value < 10 ? '0' + value : value;
}

percentage = value => {
    return Math.round(value * 100) + '%'
}

// returns the index
findLeader = sites => {
    return Object.keys(sites).reduce((a, b) => sites[a]['result']['overallScore'] > sites[b]['result']['overallScore'] ? a : b);
}

extractScoreSorted = score => {
    let scores = []
    SITES.forEach( SITE => {
        scores.push( {'label': SITE.label, 'value': SITE['result'][score]} )
    })
    return scores.sort((a, b) => b.value - a.value);
}

getRankingPerScore = () => {
    return {
        accessibilityRanking: extractScoreSorted('accessibilityScore'),
        bestpracticesRanking: extractScoreSorted('bestpracticesScore'), 
        performanceRanking: extractScoreSorted('performanceScore'),
        fieldPerformanceRanking: extractScoreSorted('fieldPerformanceScore'),
        seoRanking: extractScoreSorted('seoScore'),
        overallRanking: extractScoreSorted('overallScore')
    }
}

getHistoryPerSite = () => {
    const HISTORY = JSON.parse(fs.readFileSync('./results/history.json'), 'utf8')
    let historyPerSite = {}

    SITES.forEach( SITE => {
        historyPerSite[SITE.id] = {}
        for (const [DATE, SCORES] of Object.entries(HISTORY)) {
            historyPerSite[SITE.id][DATE] = SCORES[SITE.id]
        }
    })
    return historyPerSite
}

eval_template = (s, params) => {
  return Function(...Object.keys(params), "return " + s)
  (...Object.values(params))
}

SITES.forEach( SITE => {
    // OPTIMIZE: async all the fs read and write operations
    SITE.lighthouseResult = JSON.parse(fs.readFileSync(`./results/${SITE.id}_latest.json`), 'utf8');
    SITE.result = reduceLighthouseResult(SITE.lighthouseResult)

    generateHtmlReportFromLighthouseResult(SITE.lighthouseResult, SITE.id)
    addScoresToHistoryFile(SITE.result, SITE.id)
})

const LEADER = SITES[findLeader(SITES)]

const TEMPLATE_INDEX = fs.readFileSync('./template_index.html', {encoding: 'utf-8'})

const FETCH_TIME = SITES[0].lighthouseResult.fetchTime
const fetchtime = new Date(FETCH_TIME)
const RESULTS_META = {
    fetchtime_date: `${oneLeadingZero(fetchtime.getDate())}.${oneLeadingZero(fetchtime.getMonth()+1)}.${fetchtime.getFullYear()}`,
    fetchtime_time: `${oneLeadingZero(fetchtime.getHours())}:${oneLeadingZero(fetchtime.getMinutes())}`
}

const RENDER_OBJECT = {
    sites: SITES,
    leader: LEADER,
    meta: RESULTS_META,
    rankingPerScore: getRankingPerScore(),
    historyPerSite: getHistoryPerSite()
}

const htmlIndex = eval_template(TEMPLATE_INDEX, RENDER_OBJECT)

fs.writeFileSync('./output/index.html', htmlIndex)

console.timeEnd('📊')
