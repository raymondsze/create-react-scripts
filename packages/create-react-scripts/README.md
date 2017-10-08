-----------------
# Create React Scripts
-----------------
If you are faimilar with React, you must have heard of [create-react-app](https://github.com/facebookincubator/create-react-app) announced by Facebook.
create-react-app is great, you don't have to worry about the babel and webpack configuration before you start learning React. Its a good tool for React beginner.

How about experienced user? Is create-react-app still good? Yes and No. All the configuration are hidden by `create-react-app`. Configurations are put inside the sub package called `react-scripts`. How can we modify the configuration hidden by `create-react-app`.

## 1. Eject
`create-react-app` provides an official way to do that, which is `react-scripts eject`. By doing this way, it means that you cannot enjoy any benefit `create-react-app` will provide in the future. You have to maintain the configuration yourself and you may need to keep track of the updates from create-react-app.

## 2. Fork
Another way to extend the configuration is using a Fork of `create-react-app`. By doing this way, its just better, it would be *easier* to keep track of the updates from `create-react-app`. But... you still need to maintain the fork repository yourself. Is it worth to maintain the whole repository if you only need some modification on the configuration like *sass* and *less* supports?

## 3. React App Rewired
[react-app-rewired](https://github.com/timarney/react-app-rewired) is a moudle that you can easily extends the webpack and babel configuration by using `config.override.js`. But the `config.override.js` must be along with your project, and it is hard to share your configuration to your teammates as you cannot publish the modification into another version of `react-script`.

## 4. Roll Your Own Boilerplate
If you choose this way, then you don't even need create-react-app. But as a experienced user, setup webpack and babel configuration is a time consuming tasks. create-react-app is an official tool, I believe the choice she taken is good reference. Usually we only want to extend the configuration instead of completely rewrite.

## 5. Create React Scripts
I believe there are **No Perfect Configurations Unless You Create Your Own**.
This module helps you **easily extend the `react-scripts` to your own version of `react-scripts`**.

# Features
-----------------
+ **Easy to create your own `react-scripts` by just a simple configuration**
+ **Support similar way like what `react-app-rewired` did to modify the configuration**
+ **Able to customize script like building script `build:server` and `start:server` to support universal rendering**
+ **Composable react-scripts**

# How it works?
----------------
This module make use of **require.cache**, the following modules are replaced.
Use this module at **Your Own Risk**.

This method would be broken if the implementaion or location of following files changed.
+ react-scripts/config/paths.js
+ react-scripts/config/env.js
+ react-scripts/config/webpack.config.dev.js
+ react-scripts/config/webpack.config.prod.js
+ react-scripts/config/webpackDevServer.config.js
+ react-scripts/scripts/util/createJestConfig.js

All the above are pre-required and the require.cache got replaced according to your setting in `crs.config.js`.

To understand more, you can see the rewire [source code](https://github.com/raymondsze/create-react-scripts/blob/master/packages/create-react-scripts/rewire.js) here.

# Installation
-----------------
`npm i -D react-scripts create-react-scripts` or `yarn add --dev react-scripts create-react-scripts`  

# How to use?
-----------------
#### Option 1: Create your own react-scripts
##### Create a new node project
use `npm init` or `yarn init`
##### Modify package.json
Assume your script name is **custom-react-scripts**
```diff
// package.json
{
  "name": "custom-react-scripts",
+ "bin": {
+    custom-recat-scripts: "./bin/custom-react-scripts.js"
+  }
+ "main": "./crs.config.js"
   ...
}
```
##### Add bin/custom-react-scripts.js
Create file `bin/custom-react-scripts.js` with following content
```js
// /bin/custom-react-scripts.js
const path = require('path');

// here we need to tell create-react-scripts whild folder to lookup crs.config.js
require('create-react-scripts')(path.join(__dirname, '..'));
```
##### Add crs.config.js
Create file `crs.config.js` with following content
```js
// /crs-config.js
// The rewire procedule follow this life cycle 
// NODE_ENV==='development' env --> paths --> webpack --> devServer
// NODE_ENV==='production' env --> paths --> webpack
// NODE_ENV==='test' env --> paths --> jest

module.exports = {
  // Optional: Rewire the env
  // the env is the return result of getClientEnvironment from 'react-script/config/env.js'
  env(env, NODE_ENV, argv) {
    // modify env here...
    return env;
  },
  // Optional: Rewire the paths
  // the paths is from 'react-script/config/paths.js'
  paths(paths, NODE_ENV, argv) {
    // you can get the rewired env from 'this.env'
    // modify paths here...
    return paths;
  },
  // Optional: Rewire the webpack.config
  // if NODE_ENV === 'production'
  // the webpack config is from 'react-script/config/webpack.config.prod.js'
  // if NODE_ENV === 'development'
  // the webpack config is from 'react-script/config/webpack.config.dev.js'
  webpack(webpackConfig, NODE_ENV, argv) {
    // you can get the rewired env from 'this.env'
    // you can get the rewired paths from 'this.paths'
    // modify webpackConfig here...
    return webpackConfig;
  },
  // Optional: Rewire the webpackDevServer.config
  // the devServer is the return result of 'react-script/config/webpackDevServer.config.js'
  devServer: (webpackDevServerConfig, NODE_ENV, argv) {
    // you can get the rewired env from 'this.env'
    // you can get the rewired paths from 'this.paths'
    // you can get the rewired webpackConfig from 'this.webpack'
    // modify webpackDevServerConfig here...
    return webpackConfig;
  },
  // Optional: Rewire the jest configuration
  // the jestConfig is the return result of 'react-script/scripts/utils/createJestConfig.js'
  jest(jestConfig, NODE_ENV, argv) {
    // you can get the rewired env from 'this.env'
    // you can get the rewired paths from 'this.paths'
    // modify jestConfig here...
    return jestConfig;
  },
  // Optional: Add custom scripts
  scripts: {
    // you can add custom scripts here, for example
    // "start:server": path.join(__dirname, 'scripts/start-server.js')
  },
};
```
##### Publish
Choose either one
1. Publish your `custom-react-scripts` using `npm publish` 
2. make use of [`lerna`](https://github.com/lerna) to connect pacakges.

##### Change package.json of your project
Modify pacakge.json to use `custom-react-scripts` instead of `react-scripts`
```diff
// package.json of your react app
{
-   "start": "react-scripts start",
+   "start": "custom-react-scripts start",
-   "build": "react-scripts build",
+   "build": "custom-react-scripts build",
-   "test": "react-scripts test --env=jsdom",
+   "test": "custom-react-scripts test --env=jsdom"
}
```
#### Option 2: Customize configuration directly into your project.
##### Change package.json of your project
Modify pacakge.json to use `custom-react-scripts` instead of `create-react-scripts`
```diff
// package.json of your react app
{
-   "start": "react-scripts start",
+   "start": "create-react-scripts start",
-   "build": "react-scripts build",
+   "build": "create-react-scripts build",
-   "test": "react-scripts test --env=jsdom",
+   "test": "create-react-scripts test --env=jsdom"
}
```
##### Add crs.config.js
Create file `crs.config.js` like what we did in **Option1**.

#### Option 3: Mix Option 1 and Option 2
Modify pacakge.json to use `custom-react-scripts` instead of `create-react-scripts`
```diff
// package.json of your react app
{
-   "start": "react-scripts start",
+   "start": "create-react-scripts start",
-   "build": "react-scripts build",
+   "build": "create-react-scripts build",
-   "test": "react-scripts test --env=jsdom",
+   "test": "create-react-scripts test --env=jsdom"
}
```
##### Add crs.config.js
Remember what we did in **Option1**'s package.json `"main": "./crs.config.js"`
Now we can extend our `custom-react-scripts` in Option1.
Create file `crs.config.js` with following content
```js
// compose is a helper to merge multiple crs.config into one
const { compose } = require('create-react-scripts');
module.exports = compose(
  // extend from custom-react-scripts
  require('custom-react-scripts'),
  {
      // Optional: Rewire the env
      // the env is the return result of getClientEnvironment from 'react-script/config/env.js'
      env(env, NODE_ENV, argv) {
        // modify env here...
        return env;
      },
      // Optional: Rewire the paths
      // the paths is from 'react-script/config/paths.js'
      paths(paths, NODE_ENV, argv) {
        // you can get the rewired env from 'this.env'
        // modify paths here...
        return paths;
      },
      // Optional: Rewire the webpack.config
      // if NODE_ENV === 'production'
      // the webpack config is from 'react-script/config/webpack.config.prod.js'
      // if NODE_ENV === 'development'
      // the webpack config is from 'react-script/config/webpack.config.dev.js'
      webpack(webpackConfig, NODE_ENV, argv) {
        // you can get the rewired env from 'this.env'
        // you can get the rewired paths from 'this.paths'
        // modify webpackConfig here...
        return webpackConfig;
      },
      // Optional: Rewire the webpackDevServer.config
      // the devServer is the return result of 'react-script/config/webpackDevServer.config.js'
      devServer: (webpackDevServerConfig, NODE_ENV, argv) {
        // you can get the rewired env from 'this.env'
        // you can get the rewired paths from 'this.paths'
        // you can get the rewired webpackConfig from 'this.webpack'
        // modify webpackDevServerConfig here...
        return webpackConfig;
      },
      // Optional: Rewire the jest configuration
      // the jestConfig is the return result of 'react-script/scripts/utils/createJestConfig.js'
      jest(jestConfig, NODE_ENV, argv) {
        // you can get the rewired env from 'this.env'
        // you can get the rewired paths from 'this.paths'
        // modify jestConfig here...
        return jestConfig;
      },
      // Optional: Add custom scripts
      scripts: {
        // you can add custom scripts here, for example
        // "start:server": path.join(__dirname, 'scripts/start-server.js')
      },
  }
);
```

# API
--------------------------------
#### crs-config.js
Rewire Target
+ [env](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/config/env.js) : The return result of *getClientEnvironment* of **react-scripts/config/env**
+ [paths](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/config/paths.js): The module.exports of **react-scripts/config/paths**
+ [webpack](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/config/webpack.config.dev.js): (NODE_ENV: development) The module.exports of **react-scripts/config/webpack.config.dev.js**
+ [webpack](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/config/webpack.config.prod.js): (NODE_ENV: production) The module.exports of **react-scripts/config/webpack.config.prod.js**
+ [devServer](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/config/webpackDevServer.config.js): The return result of module.exports of **react-scripts/config/webpackDevServer.config.js**
+ [jest](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/scripts/utils/createJestConfig.js): The return result of module.exports of **react-scripts/scripts/utils/createJestConfig.js**

Parameters:
```js
module.exports = {
  env: (env, NODE_ENV, script) => {
    // env: rewire target
    // NODE_ENV: process.env.NODE_ENV
    // script: current running script
    //         possible values are (start | build | server | test)
  },
  paths: (paths, NODE_ENV, script) => {
    // paths: rewire target
    // NODE_ENV: process.env.NODE_ENV
    // script: current running script
    //         possible values are (start | build | server | test)
  },
  webpack: (webpackConfig, NODE_ENV, script) => {
    // webpackConfig: rewire target
    // NODE_ENV: process.env.NODE_ENV
    // script: current running script
    //         possible values are (start | build | server | test)
  },
  devServer: (webpackDevServerConfig, NODE_ENV, script) => {
    // webpackDevServerConfig: rewire target
    // NODE_ENV: process.env.NODE_ENV
    // script: current running script
    //         possible values are (start | build | server | test)
  },
  jest: (jestConfig, NODE_ENV, script) => {
    // jestConfig: rewire target
    // NODE_ENV: process.env.NODE_ENV
    // script: current running script
    //         possible values are (start | build | server | test)
  },
};
```

### compose
You can compose multiple crs-config together to a single crs-config.
```js
const { compose } = require('create-react-scripts')
const crsConfig1 = require('./crsConfig1');
const crsConfig2 = require('./crsConfig2');
....
const crsConfigN = require('./crsConfigN');

module.exports = compose(crsConfig1, crsConfig2, ..., crsConfigN);
```

### rewire()
##### return: { env, paths, webpack, devServer, jest }
+ **env**: rewired createClientEnvironment function
+ **paths**: rewired paths
+ **webpack**: rewired webpackConfig
+ **devServer**: rewired createWebpackDevServerConfig function
+ **jest**: rewired createJestConfig function

You can use the rewire function to obtain the rewired result.
This function is useful for creating custom script.
Example:
**react-scripts-ssr/scripts/start-server.js** [[source](https://github.com/raymondsze/create-react-scripts/blob/master/packages/create-react-scripts-ssr/scripts/start-server.js)]
**react-scripts-ssr/scripts/build-server.js** [[source](https://github.com/raymondsze/create-react-scripts/blob/master/packages/create-react-scripts-ssr/scripts/build-server.js)]
```js
const { compose } = require('create-react-scripts')
const crsConfig1 = require('./crsConfig1');
const crsConfig2 = require('./crsConfig2');
....
const crsConfigN = require('./crsConfigN');

module.exports = compose(crsConfig1, crsConfig2, ..., crsConfigN);
```

-----------------
# Why This Project Exists
-----------------
#### Create React App - Zero Configuration?
If you’re working with React, you’re probably familiar with the **create-react-app**. It’s an official command line interface for building React applications with **ZERO Configuration**.
#### ZERO Configuration? How is it possible?
**create-react-app** hides all the webpack configuration into a package **react-scripts**.
With **create-react-app**, I can **enjoy all the configuration created by Facebook without any effort** and I don't need to configure myself.

But... **you are not POSSIBLE to change the default configurations provided by Facebook create-react-app**.
Facebook provided **2 options** to allow you to change the default configurations...
1. use the **eject** script, change the configuration.
2. **fork** the create-react-app, change and republish, keep the fork up-to-date.

#### Eject or Fork?
1. **Eject**
This is a one-way operation. Once you eject, you can’t go back!
This command will remove the single build dependency from your project.
So **you cannot enjoy any benefit or update from create-react-app in the future**.

2. **Fork**
There are many fork versions of create-react-app. But normally **they only want some small changes to the configurations**... Why they need to **maintain a fork of create-react-app**?

#### What most people want in create-react-app?
1. import sass support
2. import less support
3. server-side-rendering
4. vendor dll
5. ....

However, all of them are postponed or even rejected **until the [Plugin System](https://github.com/facebookincubator/create-react-app/pull/2784) is supported by create-react-app.**
But... **only plugin got approved by Facebook can be used**...
>End-users (app developers) will only be able to use plugins which we approve and whitelist.
Typically, this means it meets a set of criteria:
1.Use-case or functionality is popular
2.Adds value
3.Easy to maintain and underlying tools are stable
4.We have control to modify & publish updates to the package

#### There are no perfect configurations unless you create your own
I believe that **create-react-app is a good reference.** We just want to extend it to build our own react-scripts.... **Why I have to eject or fork?**

#### react-app-rewired
See the medium article https://medium.com/@timarney/but-i-dont-wanna-eject-3e3da5826e39
This is a good tool that can just provide a **config.overrides.js** to modify the default configuration of **create-react-app**.
But...
The **config.overrides.js** must be along with your project... It is **not possible to create a custom version of react-scripts that could be shared with multiple projects**.

#### How about create my own react-scripts based on create-react-app?
This is why I created **create-react-scripts**.
##### create-react-scripts
This package allow you to easily create your own 'react-scripts' based on 'react-scripts' package under create-react-app.


## Inspiration
- [facebookincubator/create-react-app](https://github.com/facebookincubator/create-react-app)
- [timarney/react-app-rewired](https://github.com/timarney/react-app-rewired)
- [jaredpalmer/razzle](https://github.com/jaredpalmer/razzle)
- [react-boilerplate/react-boilerplate](https://github.com/react-boilerplate/react-boilerplate)
- [ctrlplusb/react-universally](https://github.com/ctrlplusb/react-universally)

# Author
-----------------
- [Raymond Sze](https://github.com/raymondsze)

# License
-----------------
MIT
