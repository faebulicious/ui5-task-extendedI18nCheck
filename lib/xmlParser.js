/* eslint-disable no-restricted-syntax */

const { DOMParser } = require('xmldom');
const { addTextSymbol } = require('./utils');

function extractFlatSymbols(string, symbols) {
  const matches = string.match(/\{i18n>[^}]*\}/gi);
  if (matches !== null) {
    for (let j = 0; j < matches.length; j += 1) {
      let [, symbol] = matches[j].split('>');
      symbol = symbol.substr(0, symbol.length - 1);

      addTextSymbol(symbol, symbols);
    }
  }

  return matches !== null;
}

function extractDynamicSymbols(mixed, symbols) {
  if (Array.isArray(mixed)) {
    mixed.forEach((el) => {
      extractDynamicSymbols(el, symbols);
    });
  } else if (typeof mixed === 'object') {
    for (const value of Object.values(mixed)) {
      extractDynamicSymbols(value, symbols);
    }
  } else if (typeof mixed === 'string' && /i18n>.*/i.test(mixed)) {
    const [, symbol] = mixed.split('>');

    addTextSymbol(symbol, symbols);
  }
}

function extractSymbols(string, symbols) {
  if (extractFlatSymbols(string, symbols)) {
    return;
  }

  if (/^[{[][^=:].*[:,{[].*[}\]]$/is.test(string)) {
    try {
      let stringQuoted = string.replace(
        /(['"])?([a-z0-9A-Z_]+)(['"])?\s*:/g,
        '"$2": '
      );
      stringQuoted = stringQuoted.replace(/'/g, '"');
      const value = JSON.parse(`${stringQuoted}`);

      extractDynamicSymbols(value, symbols);
    } catch (e) {}
  }
}

function readDomNode(node, symbols) {
  if (node.nodeType !== 1) {
    return;
  }

  for (let i = 0; i < node.attributes.length; i += 1) {
    extractSymbols(node.attributes[i].value.trim(), symbols);
  }

  for (let i = 0; i < node.childNodes.length; i += 1) {
    readDomNode(node.childNodes[i], symbols);
  }
}

function readTextSymbols(file) {
  return new Promise(async (resolve, reject) => {
    const content = await file.getString();

    const symbols = new Map();

    const doc = new DOMParser().parseFromString(content);

    if (!doc.documentElement) {
      reject(new Error(`Failed to parse ${file.getPath()}`));
      return;
    }

    readDomNode(doc.documentElement, symbols);

    resolve(symbols);
  });
}

async function parse(files, symbols, log, options) {
  const xmlParser = [];
  files.forEach((file) => {
    if (options.configuration && options.configuration.debug) {
      log.info(`Reading XML view: ${file.getPath()}`);
    }
    xmlParser.push(readTextSymbols(file));
  });

  try {
    const symbolList = await Promise.all(xmlParser);
    symbolList.forEach((_symbols) => {
      // eslint-disable-next-line no-restricted-syntax
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
