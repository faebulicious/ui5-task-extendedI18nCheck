/* eslint-disable no-restricted-syntax */
const path = require('path');

const { addTextSymbol } = require('./utils');

function readTextSymbols(file) {
  return new Promise(async (resolve) => {
    const content = await file.getString();

    const lines = content.split(/\r?\n/gm);

    const symbols = new Map();

    lines
      .filter((v) => v.trim() !== '' && v.trim().substr(0, 1) !== '#')
      .forEach((line) => {
        const [key] = line.split('=');
        addTextSymbol(key.trim(), symbols);
      });

    resolve(symbols);
  });
}

async function parse(files, symbols, langSymbols, log, options) {
  const i18nParser = [];
  files.forEach((file) => {
    if (options.configuration && options.configuration.debug) {
      log.info(`Reading i18n file: ${file.getPath()}`);
    }
    i18nParser.push(readTextSymbols(file));
  });

  try {
    const symbolList = await Promise.all(i18nParser);

    for (let i = 0; i < symbolList.length; i += 1) {
      let [, lang] = path.basename(files[i].getPath()).split('_');
      if (lang === undefined) {
        lang = '';
      } else {
        [lang] = lang.split('.');
      }

      const singleSymbols = new Map();

      for (const [key, value] of symbolList[i]) {
        addTextSymbol(key, symbols, value);
        addTextSymbol(key, singleSymbols, value);
      }

      langSymbols.set(lang, singleSymbols);
    }
    return true;
  } catch (e) {
    log.error(e);
    return false;
  }
}

module.exports = { parse };
