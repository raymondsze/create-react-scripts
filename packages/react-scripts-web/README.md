# react-scripts-web
-----------------
This is customized scripts that support the following
- [create-react-scripts-workbox](https://github.com/raymondsze/create-react-scripts/blob/master/packages/create-react-scripts-workbox)
- [create-react-scripts-babelrc](https://github.com/raymondsze/create-react-scripts/blob/master/packages/create-react-scripts-babelrc)
- [create-react-scripts-eslintrc](https://github.com/raymondsze/create-react-scripts/blob/master/packages/create-react-scripts-eslintrc)

# Example Usage
-----------------
##### Modify package.json
Modify `package.json` as below.
```diff
{
-   "start": "react-scripts start",
+   "start": "react-scripts-web start",
-   "build": "react-scripts build",
+   "build": "react-scripts-web build",
-   "test": "react-scripts test --env=jsdom",
+   "test": "react-scripts-web test --env=jsdom"
}
```

# Author
-----------------
- [Raymond Sze](https://github.com/raymondsze)

# License
-----------------
MIT