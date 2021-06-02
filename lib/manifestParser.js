/* eslint-disable no-restricted-syntax */
const { addTextSymbol } = require("./utils");

function readTextSymbols(file) {
  return new Promise(async (resolve) => {
    const content = await file.getString();

    const symbols = new Map();

    const matches = [...content.matchAll(new RegExp("{{([^}]+)}}", "gm"))];
    matches.forEach((match) => {
      if (match[1]) {
        addTextSymbol(match[1], symbols);
      }
    });

    resolve(symbols);
  });
}

async function parse(files, symbols, log, options) {
  const mainfestParser = [];
  files.forEach((file) => {
    if (options.configuration && options.configuration.debug) {
      log.info(`Reading js file: ${file.getPath()}`);
    }
    mainfestParser.push(
      readTextSymbols(file)
    );
  });

  try {
    const symbolList = await Promise.all(mainfestParser);
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
}

module.exports = { parse };
