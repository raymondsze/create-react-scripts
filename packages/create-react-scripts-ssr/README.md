# create-react-scripts-ssr
-----------------
This module is useful if you want to make an universal app.

# Important Note
-----------------
+ This Module **does not automate the Server-Side-Rendeirng.**
+ It just **make you able to require files that without js or json extensions in server side.**
+ The **index.html** is no longer necessary in universal app, and it could be cached by service-worker accidentally with default setting of create-react-app.
This module will detect if **index-static.html** exists instead of **index.html** to apply HTML related webpack plugins.
The generated html would also be **index-static.html**

# Scripts
-----------------
### start:server
start the both `client side bundling` and `server side bundling` webpack tasks in development mode.
The server will auto reload if code changes.
By default, **webpack-dev-server is running on port: 3001** while the **server is running on 3000**.
The following environment variables are injected to `server side bundling`

`HOST`: The host that the server should be running on.  
`PORT`: The port number that the server should be running on.  
`PROTOCOL`: The protocol that the server should be running on.  
`PUBLIC_URL`: The absolute url that the webpack-dev-server is running.  

**All client side log would be supressed in the console.**
The client build is located in `build/client`  
The server build is located in `build/server`  
An assets json manifest is located in `build/assets.json`, which is useful for server-side-rendering.  
If autodll plugin is detected, an assets json manifest is located in `build/dll-assets.json`, which is useful for server-side-rendering.  
This script will start the `webpack-dev-server` and the `server.js`  

### build:server
trigger both `client side` and `server side` webpack tasks build.  
An assets json manifest is located in `build/assets.json`, which is useful for server-side-rendering.  
You can start the server by `node build/server` after build.  

# How it works?
----------------
Webpack bundle both different environment, the client side and the server side.  
Make use of [assets-webpack-plugin](https://github.com/kossnocorp/assets-webpack-plugin) to produce assets mapping so that server side can know the filename produced in client side build.  

# Usage
---------------
##### Modify crs.config
Modify `crs.config` as below.
```js
const { compose } = require('create-react-scripts')

module.exports = compose(
  require('create-react-scripts-ssr')(),
  ...
);
```

##### Modify package.json
Modify `package.json` as below.
```diff
{
-   "start": "react-scripts start",
+   "start": "create-react-scripts start",
+   "start:server": "create-react-scripts start:server",
-   "build": "react-scripts build",
+   "build": "create-react-scripts build",
+   "build:server": "create-react-scripts build:server",
-   "test": "react-scripts test --env=jsdom",
+   "test": "create-react-scripts test --env=jsdom"
}
```
##### Add Server.js
Create `server.js` under `src` directory
```js
import React from 'react';
import HTMLDocument from 'react-html-document';
import ReactDOMServer from 'react-dom/server';
import express from 'express';
import url from 'url';
import serveStatic from 'serve-static';
import path from 'path';
import fs from 'fs';
import App from './App';

// To obtain the actual HOST, PORT, and PROTOCOL
const HOST = process.env.HOST || '0.0.0.0';
const PORT = parseInt(process.env.PORT, 10) || 5000;
const PROTOCOL = process.env.PROTOCOL || 'http';

// Assets manifest path from client-side dll build (if create-react-scripts-dll is using)
const DLL_ASSETS_PATH = path.join(process.cwd(), 'build/dll-assets.json');
// Assets manifest path from client-side build
const ASSETS_PATH = path.join(process.cwd(), 'build/assets.json');

// Wait until client-side bundling finished so that assets.json is produced
console.log('Waiting client-side bundling...');
while (!fs.existsSync(ASSETS_PATH));

// Read the assets
const assets = {
  // make sure dll assets before the assets of client-side build
  // ensure browser require the vendor module first
  ...JSON.parse(fs.readFileSync(DLL_ASSETS_PATH)),
  ...JSON.parse(fs.readFileSync(ASSETS_PATH)),
};

const app = express();
// in production, the serving files are under build/client folder
if (process.env.NODE_ENV === 'production') {
  app.use(serveStatic(path.join(process.cwd(), 'build/client'), { index: false }));
}

// render the app
app.get('*', async (req, res) => {
  // you may have some data prefetching logic here
  // ...
  res.set('content-type', 'text/html').send(
    ReactDOMServer.renderToStaticMarkup(
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="width=device-width,initial-scale=1,shrink-to-fit=no"
          />
          <meta name="theme-color" content="#000000" />
          <link rel="manifest" href={`${process.env.PUBLIC_URL}/manifest.json`} />
          <link rel="shortcut icon" href={`${process.env.PUBLIC_URL}/favicon.ico`} />
          <title>React App</title>
          {
            Object.values(assets).map(mod => mod.css ? (
              <link key={mod.css} href={mod.css} rel="stylesheet" />
            ) : null)
          }
        </head>
        <body>
          <div
            id="root"
            dangerouslySetInnerHTML={{
              __html: ReactDOMServer.renderToString(<App />),
            }}
          />
          {
            Object.values(assets).map(mod => mod.js ? (
              <script key={mod.js} src={mod.js} />
            ) : null)
          }
        </body>
      </html>
    )
  );
});

app.listen(PORT, () => {
  console.log(`Server is Running on ${url.format({ hostname: HOST, port: PORT, protocol: PROTOCOL })}!`);
});
```

##### Install source-map-support
This step is to make the source mapping correct in the stack trace if error is thrown from server-side
`npm i -S source-map-support` or `yarn add source-map-support`

##### Start Server in Development Mode
`npm run start:server` or `yarn start:server`

##### Start Server in Production Mode
`npm run build:server` or `yarn build:server`

# Working Example
[raymondsze/example-universal-react-app](https://github.com/raymondsze/create-react-scripts/tree/master/packages/example-universal-react-app)
