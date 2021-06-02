/* eslint-disable no-restricted-syntax */
const { addTextSymbol } = require('./utils');

function readTextSymbols(file, _patterns) {
  return new Promise(async (resolve) => {
    const content = await file.getString();

    const patterns = Array.isArray(_patterns) ? _patterns : [_patterns];

    const symbols = new Map();

    patterns.forEach((pattern) => {
      let regex;
      if (typeof pattern === 'string') {
        regex = new RegExp(pattern, 'gm');
      } else if (pattern.pattern) {
        regex = new RegExp(pattern.pattern, 'gm');
      } else {
        return;
      }

      const matches = [...content.matchAll(regex)];
      matches.forEach((match) => {
        let matchIndex = 1;
        while (match[matchIndex]) {
          if (!pattern.groups || pattern.groups.indexOf(matchIndex) >= 0) {
            addTextSymbol(match[matchIndex], symbols);
          }
          matchIndex += 1;
        }
      });
    });

    resolve(symbols);
  });
}

async function parse(files, symbols, log, options) {
  if (options.configuration && options.configuration.parseJavascript) {
    const jsParser = [];
    files.forEach((file) => {
      if (options.configuration && options.configuration.debug) {
        log.info(`Reading js file: ${file.getPath()}`);
      }
      jsParser.push(
        readTextSymbols(file, options.configuration.javascriptPatterns)
      );
    });

    try {
      const symbolList = await Promise.all(jsParser);
      symbolList.forEach((_symbols) => {
        for (const [key, value] of _symbols) {
          addTextSymbol(key, symbols, value);
        }
      });

      return true;
    } catch (e) {
      log.error(e);
      return false;
    }
  } else {
    return true;
  }
}

module.exports = { parse };
