async function retrieveFiles(workspace, log) {
  const i18nResources = workspace.byGlob([
    '**/i18n*.properties',
    '!**/node_modules/**',
  ]);
  const xmlResources = workspace.byGlob([
    '**/*.{view,fragment}.xml',
    '!**/node_modules/**',
  ]);
  const jsResources = workspace.byGlob([
    '**/{controller,model}/*.js',
    '**/model/*.js',
    '!**/node_modules/**',
    '!**/localService/**',
    '!**/test/**',
  ]);
  const mainfestResources = workspace.byGlob([
    '**/manifest.json',
    '!**/node_modules/**',
    '!**/localService/**',
    '!**/test/**',
  ]);

  let i18nFiles;
  let xmlFiles;
  let jsFiles;
  let manifestFiles;

  try {
    [i18nFiles, xmlFiles, jsFiles, manifestFiles] = await Promise.all([
      i18nResources,
      xmlResources,
      jsResources,
      mainfestResources,
    ]);

    return {
      i18nFiles: i18nFiles,
      xmlFiles: xmlFiles,
      jsFiles: jsFiles,
      manifestFiles: manifestFiles,
    };
  } catch (e) {
    log.error(`Couldn't read files: ${e}`);
    return false;
  }
}

function addTextSymbol(symbol, symbols, increment) {
  let count = symbols.get(symbol);
  if (count === undefined) {
    count = 0;
  }

  if (!increment) {
    count += 1;
  } else {
    count += increment;
  }

  symbols.set(symbol, count);
}

function convertLangCodeToFlag(_code) {
  const [code] = _code.split('-');
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => c.charCodeAt() + 0x1f1a5)
  );
}

module.exports = { retrieveFiles, addTextSymbol, convertLangCodeToFlag };
