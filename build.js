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
    buildSite();
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
  return new Promise((resolve, reject) => {
    resolve();
  });
}

async function buildStyles() {
  return new Promise((resolve, reject) => {
    resolve();
  });
}

async function buildScripts() {
  return new Promise((resolve, reject) => {
    resolve();
  });
}
