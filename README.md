# UI5 task for checking translations

![GitHub](https://img.shields.io/github/license/faebulicious/ui5-task-extendedI18nCheck)
![npm](https://img.shields.io/npm/v/ui5-task-extendedi18ncheck)

UI5 task for checking missing and duplicate translations in i18n properties used in XML views and javascript sources.

## Prerequisites

- Requires at least [`@ui5/cli@3.0.0`](https://sap.github.io/ui5-tooling/v3/pages/CLI/) (to support [`specVersion: "3.0"`](https://sap.github.io/ui5-tooling/pages/Configuration/#specification-version-30))

> :warning: **UI5 Tooling Compatibility**
> All releases of this tooling extension using the major version `3` require UI5 Tooling V3. Any previous releases below major version `3` (if available) also support older versions of the UI5 Tooling. But the usage of the latest UI5 Tooling is strongly recommended!

## Install

```bash
npm install ui5-task-extendedi18ncheck --save-dev
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: true|false  
  Verbose logging
- parseJavascript: true|false  
  Enable javascript parsing
- javascriptPatterns: [Array]  
  RegEx Patterns to match keys within javascript sources
- usedKeys: [Array]  
  Exception list of text keys which are not recognized by the task logic itself

### Javascript Patterns

Javascript patterns must include at least one regex group, which will be considered as the key. Patterns can be defined as a standalone string only. In this case _all_ groups are considered as text keys.

If you need more control about the relevant groups, an object can be provided including the pattern itself and an array of the group indizes to be considered as text keys.

```
javascriptPatterns:
  - \.getText\(\s*['"]([A-Za-z0-9]+)['"]\s*(,[^)]+)?\)
  - pattern: \.getText\([\s\S]*\?[\s\r\n]*['"]([A-Za-z0-9]+)['"][\s\r\n]*:[\s\r\n]*['"]([A-Za-z0-9]+)['"][\s\r\n]*(,[^)]+)?\)
    groups:
      - 1
      - 2
```

## Usage

1. Define the dependency in `$yourapp/package.json`:

```json
"devDependencies": {
    // ...
    "ui5-task-extendedi18ncheck": "*"
    // ...
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array.

2. configure it in `$yourapp/ui5.yaml`:

```yaml
builder:
  customTasks:
    - name: ui5-task-extendedi18ncheck
      afterTask: replaceVersion
      configuration:
        debug: false
        parseJavascript: true
        javascriptPatterns:
          - pattern: \.getText\(\s*['"]([A-Za-z0-9]+)['"]\s*(,[^)]+)?\)
            groups:
              - 1
          - pattern: \.getText\(.*\?\s*['"]([A-Za-z0-9]+)['"]\s*:\s*['"]([A-Za-z0-9]+)['"]\s*(,[^)]+)?\)
            groups:
              - 1
              - 2
        usedKeys:
          - text1
          - text2
```

## How it works

The tasks extracts all the used i18n keys from XML views and optionally from javascript sources. In XML views only the keys of the model `i18n` are recognized (`i18n>key`). It also supports complex notations based on object notations like:

```xml
<m:Text
  text="{
        parts:[
          {path: 'amountperunit_net'},
          {path:'i18n>text'}
        ],
        type: 'sap.ui.model.type.Currency',
        formatOptions: {showMeasure: false}
        }" />
```

Javascript files are not checked by default, as the recognition patterns highly depends on your code. The above example recognizes keys when the method `getText(key [,params])` is called.

Because not every text key can be recognized via patterns, used symbols can also be defined within the configuration to define a list of exceptions.

Once all the keys have been extracted messages are generated for the following use cases:

- Keys which _may_ not be used in your code (_always double check if this is correct!_)
- Keys which are missing in your property files
- Duplicate keys within your property files

```bash
WARN builder:custom:i18ncheck 🌍 Symbol "myKey1" may not be used
WARN builder:custom:i18ncheck 🌍 Symbol "myKey2" may not be used
ERR! builder:custom:i18ncheck 🌍 missing Symbol "myKey0"
ERR! builder:custom:i18ncheck 🌍 duplicate Symbol "myKey10"
ERR! builder:custom:i18ncheck 🇩🇪 duplicate Symbol "myKey10"
```

## License

This work is licensed under the [MIT License](./LICENSE).
