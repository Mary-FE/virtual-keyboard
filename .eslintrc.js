module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "overrides": [
    ],
    "parser": "@babel/eslint-parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "requireConfigFile": false,
        "babelOptions": {
            "plugins": [
              '@babel/plugin-syntax-import-assertions'
            ],
          },
    },
    "rules": {
    }
}
