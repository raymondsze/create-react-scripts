# create-react-scripts-graphql
-----------------
This is useful if you use Apollo and you want to enable `.graphql/.gql` extension support.
Add [graphql-tag/loader](https://github.com/apollographql/graphql-tag) support.
Add [jest-transform-graphql](https://github.com/remind101/jest-transform-graphql) support.

Example Usage:
##### Modify crs.config
Modify `crs.config` as below.
```js
const { compose } = require('create-react-scripts');
module.exports = compose(
  ...
  require('create-react-scripts-graphql')(/* options provided to graphql-tag/loader */),
);
```