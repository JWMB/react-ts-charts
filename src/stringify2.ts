import * as stringify from 'json-stringify-pretty-compact';

// tslint:disable-next-line:no-any
export function stringify2(data: any, config?: { maxLength?: number, indent?: number}) {
    let configAsString = stringify(data, config);
    const rxEmptyBracketLine = /(\n\s*)({)(\s*\n\s*)/g;
    // TODO: PR to json-stringify-pretty-compact ?
    while (true) {
      const matches = rxEmptyBracketLine.exec(configAsString);
      if (!matches || !matches.length) {
        break;
      }
      if (matches.length === 4) {
        const index = matches.slice(1, 2).map(m => m.length).reduce((p, c) => p + c);
        configAsString = configAsString.substr(0, matches.index + index) + '{ '
          + configAsString.substr(matches.index + matches[0].length);
      }
    }
    return configAsString;
}