# UI5 task for checking translations

 UI5 task for checking missing and duplicate translations in i18n properties used in XML views and javascript sources.

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
RegEx Pattern to match keys within javascript sources
- usedKeys: [Array]  
Used text keys which are not recognized by the task

### Javascript Patterns
Javascript patterns must include at least one Regex group, which will be recognized as the key. Patterns can be defines as a standalone string only. In this case _all_ groups are considered as text keys. 

If you need more control, an object can be provided including the pattern it self and an array of the group indizes to be considered as text keys.

```
javascriptPatterns:
  - \.getText\(\s*['"]([A-Za-z0-9]+)['"]\s*(,[^)]+)?\)
  - pattern: \.getText\(.*\?\s*['"]([A-Za-z0-9]+)['"]\s*:\s*['"]([A-Za-z0-9]+)['"]\s*(,[^)]+)?\)
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
},
"ui5": {
  "dependencies": [
    // ...
    "ui5-task-extendedi18ncheck",
    // ...
  ]
}
```

> As the devDependencies are not recognized by the UI5 tooling, they need to be listed in the `ui5 > dependencies` array. In addition, once using the `ui5 > dependencies` array you need to list all UI5 tooling relevant dependencies.

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

The tasks extracts all the used i18n-keys from XML views and optionally from javascript sources. In XML views only the keys of the model `i18n` are recognized (`i18n>key`). It also support complex notations based on the object notation. 

Javascript files are not checked by default, as the recognition patterns highly depends on your code. The above example recognizes keys when the method `getText(key [,params])` is called. 

Because not every text key can be recognized via patterns, used symbols can also be defined within the configuration to define a list of exceptions.

Once all the keys have been extracted messages are generated for the following use cases:

- Keys which *may* not be used in your code
- Keys which are missing in your property files
- Duplicate keys within your property files

```bash
WARN builder:custom:i18ncheck 🌍 Symbol "fadsfas" may not be used
WARN builder:custom:i18ncheck 🌍 Symbol "pricePerUnitPerMonthPlaceholder" may not be used
ERR! builder:custom:i18ncheck 🌍 missing Symbol "pricingGross"
ERR! builder:custom:i18ncheck 🌍 duplicate Symbol "discountGlobal"
ERR! builder:custom:i18ncheck 🇩🇪 duplicate Symbol "discountGlobal"
```

## License

This work is licensed under the [MIT License](./LICENSE).
