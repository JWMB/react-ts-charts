// type MyDate = {
//     year: number,
//     month: number,
//     day: number
// };
export class SimpleDate {
    year: number;
    month: number;
    day: number;
    static parse(str: string) {
        const parts = str.split('-').map(c => c === '??' ? -1 : parseFloat(c));
        const result = new SimpleDate();
        result.year = parts[0];
        result.month = parts[1];
        result.day = parts[2];
        return result;
    }
}
export class DateFormat {
    static getDateParserCanThrow(format: string | undefined) {
        const p = DateFormat.getDateParser(format);
        if (!p) {
            throw new Error('Couldn\'t parse format: ' + format);
        }
        return p;
    }
    static getDateParser(format: string | undefined) {
        if (!format) {
            return undefined;
        }
        if (format === 'yyyy.ffff') {
            return (s: string) => {
                // TODO: doesn't honor leap years
                const dayInYear = 365 * parseFloat('0.' + s.substr(5));
                const date = new Date(parseFloat(s.substr(0, 4)), 0, 1);
                date.setDate(dayInYear);
                return date;
            };
        }
        const fFindPart = (partType: string, formatA: string) => {
            const rx = new RegExp('' + partType + '+');
            const m = rx.exec(formatA);
            if (m) {
                return { index: m.index, length: m[0].length };
            }
            return { index: -1, length: 0 };
        };
        const parts = 'ymd'.split('').map(c => ({ partType: c, ...fFindPart(c, format) }))
            .filter(p => p.index >= 0);
        if (parts.length === 3) {
            const pYear = parts.find(p => p.partType === 'y');
            const fGetYear = pYear
                ? pYear.length === 4
                    ? (s: string) => parseFloat(s.substr(pYear.index, pYear.length))
                    : (s: string) => {
                        const y = parseFloat(s.substr(pYear.index, pYear.length));
                        return y + (y < 30 ? 2000 : 1900);
                    }
                : (s: string) => 1900;
            const pMonth = parts.find(p => p.partType === 'm');
            const fGetMonth = pMonth
                ? (s: string) => parseFloat(s.substr(pMonth.index, pMonth.length)) - 1
                : (s: string) => 0;

            const pDay = parts.find(p => p.partType === 'd');
            const fGetDay = pDay
                ? (s: string) => parseFloat(s.substr(pDay.index, pDay.length))
                : (s: string) => 1;

            return (s: string) =>
                new Date(Date.UTC(
                    fGetYear(s),
                    fGetMonth(s),
                    fGetDay(s)));
        }
        return undefined;
    }

    // TODO: what we want is a progressive guesser:
    // if we can't determine format with a single example, feed it more
    // e.g. aa/bb which is month? once one is > 12 we'll know
    static guessDateFormat(str: string): string | undefined {
        if (str.indexOf('.') === 4) {
            return 'yyyy.ffff';
        }
        const m = /\d+/.exec(str);
        if (m && m[0] === str) {
            // only numeric
            if (str.length === 6) {
                return 'yymmdd';
            }
        }
        return undefined;

        // const rxSeparators = /[-\s/\.]+/g;
        // const parts: string[] = [];
        // while (true) {
        //     const m = rxSeparators.exec(str);
        //     if (m && m.length) {
        //     } else {
        //         break;
        //     }
        // }

        // let format = str.replace(/\d/g, 'x');
        // let nonSeparatorParts = str.split(/[-\s/\.]+/); // \D+
        // const fourChars = nonSeparatorParts.filter(p => p.length === 4);
        // if (fourChars.length > 0) {
        //     // we probably have a year here
        //     if (fourChars.length === 1) {
        //         nonSeparatorParts[nonSeparatorParts.indexOf(fourChars[0])] = 'yyyy';
        //     }
        // }
        // if (str.indexOf('.') === 4) {
        //     return 'yyyy.ffff';
        // }
        // if (str.indexOf('/') > 0) {
        //     // month/day/year
        //     if (str.indexOf('-') > 0) {
        //         // 3/12-09
        //     }
        // }
        // const m = /\d+/.exec(str);
        // if (m && m[0] === str) {
        //     if (str.length === 6) {
        //         return 'yymmdd';
        //     }
        // }
    }
}

export class DateRange {
    static createMultiGetIsInRangeFunction(input: [SimpleDate, SimpleDate][]): (date: Date) => boolean {
        const checks = input.map(range => DateRange.createGetIsInRangeFunction(range[0], range[1]));
        return (date: Date) => {
            return !!checks.find(c => c(date));
         };
    }
    static createGetIsInRangeFunction(rangeStart: SimpleDate, rangeEnd: SimpleDate): (date: Date) => boolean {
        // const fIsInRange = (date: Date, rangeStart: MyDate, rangeEnd: MyDate): boolean => {
        // TODO: this is naïve and only works for certain range types
        return (date: Date): boolean => {
            const y = date.getFullYear();
            if (rangeStart.year > 0) {
                if (rangeStart.year > 0) {
                    if (y < rangeStart.year) {
                        return false;
                    }
                    if (y === rangeStart.year) {
                        if (date.getMonth() + 1 < rangeStart.month) {
                            return false;
                        }
                        if (date.getMonth() + 1 === rangeStart.month) {
                            if (date.getDate() < rangeStart.day) {
                                return false;
                            }
                        }
                    }
                }
                if (rangeEnd.year > 0) {
                    if (y > rangeEnd.year) {
                        return false;
                    } else if (y === rangeEnd.year) {
                        if (date.getMonth() + 1 > rangeEnd.month) {
                            return false;
                        }
                        if (date.getMonth() + 1 === rangeEnd.month) {
                            if (date.getDate() > rangeEnd.day) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            }
            const m = date.getMonth() + 1;
            const d = date.getDate();
            if (rangeStart.month > 0) {
                if (rangeEnd.month < rangeStart.month) {
                    if (m > rangeEnd.month && m < rangeStart.month) {
                        return false;
                    }
                } else {
                    if (m < rangeStart.month || m > rangeEnd.month) {
                        return false;
                    }
                }
                if (m === rangeStart.month) {
                    if (d < rangeStart.day) {
                        return false;
                    }
                }
                if (m === rangeEnd.month) {
                    if (d > rangeEnd.day) {
                        return false;
                    }
                }
            }
            return true;
        };
        // const parsedRanges = this.ranges.map(range => {
        //     // [['??-06-01', '??-09-01'], ['??-12-15', '??-01-15']]
        //     return range.map(r => {
        //         const parts = r.split('-').map(c => c === '??' ? -1 : parseFloat(c));
        //         return <MyDate>{ year: parts[0], month: parts[1], day: parts[2] };
        //     });
        // });
    }    
}