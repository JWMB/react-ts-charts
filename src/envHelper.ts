export class EnvHelper {
    static rxFindString = /({process\.env\.)(REACT_APP_\w+)(})/g;
    static replaceInString(str: string): string {
        return EnvHelper.regExpReplace(EnvHelper.rxFindString, str, (m) => {
            if (m.length > 2) {
                // // tslint:disable-next-line:no-console
                // console.log('ss', m[2], process.env[m[2]]);
                return <string>process.env[m[2]];
            }
            return null;
         });
    }
    // TODO: separate class - probably exists as npm module
    static regExpReplace(rx: RegExp, input: string, replacer: (m: RegExpExecArray) => string | null) {
        let result = '';
        let lastIndex = 0;
        while (true) {
            const m = rx.exec(input);
            if (!m || m.length === 0) {
                break;
            }
            const replaceWith = replacer(m);
            if (replaceWith !== null) {
                result += input.substring(lastIndex, m.index) + replaceWith;
                // // tslint:disable-next-line:no-console
                // console.log('ss', lastIndex, m.index);
                lastIndex = m.index + m[0].length;
            }
        }
        if (lastIndex < input.length) {
            result += input.substring(lastIndex);
        }
        return result;
    }
}