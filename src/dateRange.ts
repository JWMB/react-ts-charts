// type MyDate = {
//     year: number,
//     month: number,
//     day: number
// };
export class MyDate {
    year: number;
    month: number;
    day: number;
    static parse(str: string) {
        const parts = str.split('-').map(c => c === '??' ? -1 : parseFloat(c));
        const result = new MyDate();
        result.year = parts[0];
        result.month = parts[1];
        result.day = parts[2];
        return result;
    }
}

export class DateRange {
    static createMultiGetIsInRangeFunction(input: [MyDate, MyDate][]): (date: Date) => boolean {
        const checks = input.map(range => DateRange.createGetIsInRangeFunction(range[0], range[1]));
        return (date: Date) => {
            return !!checks.find(c => c(date));
         };
    }
    static createGetIsInRangeFunction(rangeStart: MyDate, rangeEnd: MyDate): (date: Date) => boolean {
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