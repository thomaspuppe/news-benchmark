console.time('📊')
const fs = require('fs')

const WHOLE_RESULT_ZEIT = JSON.parse(fs.readFileSync('./results/zeit_latest.json'), 'utf8');
const WHOLE_RESULT_WELT = JSON.parse(fs.readFileSync('./results/welt_latest.json'), 'utf8');
const WHOLE_RESULT_SPIEGEL = JSON.parse(fs.readFileSync('./results/spiegel_latest.json'), 'utf8');
const WHOLE_RESULT_FAZ = JSON.parse(fs.readFileSync('./results/faz_latest.json'), 'utf8');
const WHOLE_RESULT_SUEDDEUTSCHE = JSON.parse(fs.readFileSync('./results/sueddeutsche_latest.json'), 'utf8');

reduceResults = wholeResult => {
    return {
        accessibilityScore: wholeResult.categories.accessibility.score,
        bestpracticesScore: wholeResult.categories['best-practices'].score,
        performanceScore: wholeResult.categories.performance.score,
        seoScore: wholeResult.categories.seo.score
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
    function sum(obj) {
        return Object.keys(obj).reduce((sum,key)=>sum+parseFloat(obj[key]||0),0)
    }

    const scores = {
        zeit: sum(results.zeit),
        welt: sum(results.welt),
        spiegel: sum(results.spiegel),
        faz: sum(results.faz),
        sueddeutsche: sum(results.sueddeutsche)
    }
    return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
}

const LEADER = findLeader(RESULTS)

RESULTS.leader = RESULTS[LEADER]
RESULTS.leader.name = LEADER

const templateIndex = fs.readFileSync('./template_index.html', {encoding: 'utf-8'})

function eval_template(s, params) {
  return Function(...Object.keys(params), "return " + s)
    (...Object.values(params));
}

const htmlIndex = eval_template(templateIndex, RESULTS)

fs.writeFileSync('./output/index.html', htmlIndex)

console.timeEnd('📊')
