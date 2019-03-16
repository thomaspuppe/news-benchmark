console.time('📊')
const fs = require('fs')

const WHOLE_RESULT_ZEIT = JSON.parse(fs.readFileSync('./results/zeit_latest.json'), 'utf8');
const WHOLE_RESULT_WELT = JSON.parse(fs.readFileSync('./results/welt_latest.json'), 'utf8');
const WHOLE_RESULT_SPIEGEL = JSON.parse(fs.readFileSync('./results/spiegel_latest.json'), 'utf8');
const WHOLE_RESULT_FAZ = JSON.parse(fs.readFileSync('./results/faz_latest.json'), 'utf8');
const WHOLE_RESULT_SUEDDEUTSCHE = JSON.parse(fs.readFileSync('./results/sueddeutsche_latest.json'), 'utf8');

const FETCH_TIME = WHOLE_RESULT_ZEIT.fetchTime

reduceResults = wholeResult => {
    return {
        accessibilityScore: wholeResult.categories.accessibility.score,
        bestpracticesScore: wholeResult.categories['best-practices'].score,
        performanceScore: wholeResult.categories.performance.score,
        seoScore: wholeResult.categories.seo.score,
        overallScore: wholeResult.categories.accessibility.score + wholeResult.categories['best-practices'].score + wholeResult.categories.performance.score + wholeResult.categories.seo.score
    }
}

const RESULT_ZEIT = reduceResults(WHOLE_RESULT_ZEIT)
const RESULT_WELT = reduceResults(WHOLE_RESULT_WELT)
const RESULT_SPIEGEL = reduceResults(WHOLE_RESULT_SPIEGEL)
const RESULT_FAZ = reduceResults(WHOLE_RESULT_FAZ)
const RESULT_SUEDDEUTSCHE = reduceResults(WHOLE_RESULT_SUEDDEUTSCHE)

let RESULTS = {
    zeit: RESULT_ZEIT,
    welt: RESULT_WELT,
    spiegel: RESULT_SPIEGEL,
    faz: RESULT_FAZ,
    sueddeutsche: RESULT_SUEDDEUTSCHE
}

// TODO: this is very naive. Find a better structure and better way.
findLeader = results => {
    return Object.keys(results).reduce((a, b) => results[a]['overallScore'] > results[b]['overallScore'] ? a : b);
}

const LEADER = findLeader(RESULTS)

RESULTS.leader = RESULTS[LEADER]
RESULTS.leader.name = LEADER

const templateIndex = fs.readFileSync('./template_index.html', {encoding: 'utf-8'})

function eval_template(s, params) {
  return Function(...Object.keys(params), "return " + s)
  (...Object.values(params))
}

const fetchtime = new Date(FETCH_TIME)
RESULTS.meta = {
    fetchtime_date: `${fetchtime.getDate()}.${fetchtime.getMonth()+1}.${fetchtime.getFullYear()}`,
    fetchtime_time: `${fetchtime.getHours()}:${fetchtime.getMinutes()}`
}

const htmlIndex = eval_template(templateIndex, RESULTS)

fs.writeFileSync('./output/index.html', htmlIndex)

console.timeEnd('📊')
