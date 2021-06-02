const log = require('@ui5/logger').getLogger('builder:custom:i18ncheck');

const { parse: parseXMLFiles } = require('./xmlParser');
const { parse: parseJSFiles } = require('./jsParser');
const { parse: parseManifestFiles } = require('./manifestParser');
const { parse: parseI18nFiles } = require('./i18nParser');
const {
  retrieveFiles,
  convertLangCodeToFlag,
  addTextSymbol,
} = require('./utils');

module.exports = async function ({
  workspace,
  // eslint-disable-next-line no-unused-vars
  dependencies,
  // eslint-disable-next-line no-unused-vars
  taskUtil,
  options,
}) {
  const usedSymbols = new Map();
  const allI18nSymbols = new Map();
  const langSymbols = new Map();

  const files = await retrieveFiles(workspace, log);
  if (!files) {
    return;
  }

  const { i18nFiles, xmlFiles, jsFiles, manifestFiles } = files;

  if (
    (await parseXMLFiles(xmlFiles, usedSymbols, log, options)) === false ||
    (await parseJSFiles(jsFiles, usedSymbols, log, options)) === false ||
    (await parseManifestFiles(manifestFiles, usedSymbols, log, options)) ===
      false ||
    (await parseI18nFiles(
      i18nFiles,
      allI18nSymbols,
      langSymbols,
      log,
      options
    )) === false
  ) {
    return;
  }

  if (
    options.configuration &&
    options.configuration.usedKeys &&
    Array.isArray(options.configuration.usedKeys)
  ) {
    options.configuration.usedKeys.forEach((symbol) => {
      addTextSymbol(symbol, usedSymbols);
    });
  }

  const unusedSymbols = [];
  const langMessages = new Map();

  for (const lang of langSymbols.keys()) {
    langMessages.set(lang, { missing: [], duplicate: [] });
  }

  // Check for Unused Symbols
  for (const symbol of allI18nSymbols.keys()) {
    if (!usedSymbols.has(symbol)) {
      unusedSymbols.push(symbol);
    } else {
      // Check if available in language files
      langSymbols.forEach((symbols, lang) => {
        if (!symbols.has(symbol)) {
          langMessages.get(lang).missing.push(symbol);
        }
      });
    }
  }

  // Check for duplicates!
  langSymbols.forEach((symbols, lang) => {
    symbols.forEach((count, symbol) => {
      if (count > 1) {
        langMessages.get(lang).duplicate.push(symbol);
      }
    });
  });

  if (unusedSymbols.length > 0) {
    log.warn(`🌍 ${unusedSymbols.length} possible unused symbols`);
    unusedSymbols.forEach((symbol) => {
      log.warn(`🌍 Symbol "${symbol}" may not be used`);
    });
  }

  langMessages.forEach((info, _lang) => {
    let lang;
    if (_lang !== '') {
      lang = convertLangCodeToFlag(_lang);
    } else {
      lang = '🌍';
    }
    info.missing.forEach((symbol) => {
      log.error(`${lang} missing Symbol "${symbol}"`);
    });
    info.duplicate.forEach((symbol) => {
      log.error(`${lang} duplicate Symbol "${symbol}"`);
    });
  });
};
