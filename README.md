This project is the output of my first react dabbling.
* [Monaco editor](https://microsoft.github.io/monaco-editor/) with [react-monaco-editor](https://www.npmjs.com/package/react-monaco-editor)
* [Highcharts](https://www.npmjs.com/package/highcharts) with [react-highcharts](https://www.npmjs.com/package/react-highcharts)

Bootstrapped with [TypeScript React Starter](https://github.com/Microsoft/TypeScript-React-Starter).

## Problems
### highcharts-exporting
doesn't work with react-highcharts?
https://github.com/kirjs/react-highcharts/issues/92
### jest
Latest jest not [compatible](https://github.com/facebook/jest/issues/5119)
```
TypeError: environment.setup is not a function
```
Will add tests when this works again
### Monaco Editor 
Cross-domain web workers not allowed on localhost, needs [proxy](https://github.com/Microsoft/monaco-editor#integrate-cross-domain)
Would be nice to not require internet while developing, look into that.
Maybe chrome extension [Allow-Control-Allow-Origin: *](https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi?hl=en)
or chrome --disable-web-security
## TODOs
