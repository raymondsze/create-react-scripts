# create-react-scripts-eslintrc
-----------------
Mark **useEslintrc** option to true in [eslint-loader](https://github.com/MoOx/eslint-loader).
This is very useful if you want to add some external eslint rules into webpack pre build.

Example Usage:
##### Modify crs.config
Modify `crs.config` as below.
```js
const { compose } = require('create-react-scripts');
module.exports = compose(
  ...
  require('create-react-scripts-eslintrc')(),
);
```

##### Create .eslintrc
Create `.eslintrc` under your application folder
For example, I want to use `airbnb` eslint styling.
```
{
  "parser": "babel-eslint",
  "extends": ["airbnb"]
}
```
