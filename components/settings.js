'use strict';

const fs = require('fs');

/**
 * Parses JSON from project root to array.
 * @return {String[]} JSON like array of settings.
 */
function parseJson() {
  let parsedJson;

  try {
    parsedJson = JSON.parse(
      fs.readFileSync('config.json', {encoding: 'utf8'})
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Config must be a valid JSON document.');
    } else {
      throw new Error(`You need to supply config.json in project root,
                       see config.json.example`);
    }
  }

  return parsedJson;
}

module.exports = parseJson();
