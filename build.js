'use strict';

const path = require('path');
const fs = require('fs');
const yaml = require('node-yaml');
const pug = require('pug');
const sass = require('node-sass');

const OUTPUT_DIR = process.env.OUTPUT_DIR || 'dist';

init();
async function init() {
  try {
    const start = Date.now();
    console.log(`[BUILD] starting...`);
    await buildSite();
    const duration = Date.now() - start;
    console.log(`[BUILD] completed in ${duration}ms`);
  } catch (err) {
    console.error(err);
  }
}

async function buildSite() {
  return Promise.all([
    buildMarkup(),
    buildStyles(),
    buildScripts()
  ]);
}

async function buildMarkup() {
  const {events, talks} = loadEngagements();
  let past = events.filter(event => (Date.now() >= +event.date.date));
  let upcoming = events.filter(event => (Date.now() < +event.date.date));

  return Promise.all([
    buildFile('index', {
      events: {
        upcoming,
        past
      },
      talks
    })
  ]);

  function buildFile(page, props) {
    return new Promise((resolve, reject) => {
      const render = pug.compileFile(path.resolve(__dirname, `templates/${page}.pug`), {pretty:true});
      const html = render(props);
      fs.writeFile(path.resolve(__dirname, OUTPUT_DIR, `${page}.html`), html, err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

async function buildStyles() {
  const source = path.resolve(__dirname, 'sass/main.scss');
  const output = path.resolve(__dirname, OUTPUT_DIR, 'css/main.css');

  return new Promise((resolve, reject) => {
    console.info(`  Building styles...`);
    sass.render({
      file: source,
      outFile: output,
      sourceMap: true,
      outputStyle: 'compact'
    }, (err, result) => {
      if (err) return reject(err);

      fs.writeFile(output, result.css, err => {
        if (err) return reject(err);
        console.info(`  \u2713 styles done.`);
        resolve();
      });
    });
  });
}

async function buildScripts() {
  return new Promise((resolve, reject) => {
    console.info(`  Building scripts...`);
    setTimeout(() => {
      console.info(`  \u2713 scripts done.`);
      resolve();
    }, 400);
  });
}

function loadEngagements() {
  const {events, talks} = yaml.readSync(path.resolve(__dirname, 'engagements.yml')) || [];
  return {
    events: events.map(cleanup).filter(event => !event.hidden).sort(sort),
    talks: Object.keys(talks).map(key => talks[key]).filter(talk => !talk.deprecated).sort((a, b) => a.sort > b.sort)
  };

  function cleanup(ev) {
    ev.talk = !!talks[ev.talk] ? talks[ev.talk] : null;
    if (ev.talk === null) ev.hidden = true;
    ev.date = formatDate(ev.date);
    return ev;
  }

  function sort(a, b) {
    return parseInt(a.date.date.getTime()) <= parseInt(b.date.date.getTime());
  }

  function formatDate(dt) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr',
      'May', 'Jun', 'Jul', 'Aug',
      'Sep', 'Oct', 'Nov', 'Dec'
    ];

    let d = new Date(dt);
    return {
      date: d,
      formatted: `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
    };
  }
}
