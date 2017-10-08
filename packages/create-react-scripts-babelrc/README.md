# create-react-scripts-babelrc
-----------------
Mark **babelrc** option to true in [babel-loader](https://github.com/babel/babel-loader).
This is very useful if you want to add some external babel feature into webpack build.

Example Usage:
##### Modify crs.config
Modify `crs.config` as below.
```js
const { compose } = require('create-react-scripts');
module.exports = compose(
  ...
  require('create-react-scripts-babelrc')(),
);
```

##### Create .babelrc
Create `.babelrc` under your application folder
For example, I want to enable `stage-0` and `decorator` supports.
```
{
  "presets": ["react-app", "stage-0"],
  "plugins": ["transform-decorators-legacy"]
}
```
