import React from 'react';
import ReactDOMServer from 'react-dom/server';
import express from 'express';
import url from 'url';
import fetch from 'node-fetch';
import serveStatic from 'serve-static';
import path from 'path';
import fs from 'fs';
import App from './App';

// For development, the server path is specified in process.env.SERVICE_URL
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || '5000';
const PROTOCOL = process.env.PROTOCOL || 'http';

const ASSETS_PATH = path.join(process.cwd(), 'build/assets.json');
const DLL_ASSETS_PATH = path.join(process.cwd(), 'build/dll-assets.json');

console.log('Waiting client-side bundling...');
while (!fs.existsSync(ASSETS_PATH));

const assets = {
  ...JSON.parse(fs.readFileSync(DLL_ASSETS_PATH)),
  ...JSON.parse(fs.readFileSync(ASSETS_PATH)),
};

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.use(serveStatic(path.join(process.cwd(), 'build/client'), { index: false }));
}

app.get('*', async (req, res) => {
  console.log('SeverSideRendering');
  // we don't need to care css or js stuff as already included in data
  // but if we want dynamic html page, we could use the assets variable from the above
  // render the component to root div
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
