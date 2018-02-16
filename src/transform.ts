import { SimpleDate, DateRange } from './dateRange';

export interface TransformSettings {
    class?: string;
    userCode?: string;
    // tslint:disable-next-line:no-any
    [x: string]: any;
}

export type DataType = [number, number] | number;

export abstract class Transform {
    abstract execute(data: DataType[]): DataType[]; // (Date | number)
}

export class UserCode extends Transform {
    code: string;

    // tslint:disable-next-line:no-any
    static createTransformFunction(data: any[], userCode: string): (data: any[]) => any[] {
        if (data.length) {
            if (!userCode) {
                userCode = 'value';
            }
            if (userCode.indexOf('return') < 0) {
                userCode = 'return ' + userCode + ';';
            }
            // TODO: use sandbox, e.g. https://github.com/asvd/jailed
            const fInner = Function('value', 'index', 'arr', 'previous', 'lastResult', userCode);
            if (typeof data[0] === 'object') {
                if ((data[0] as Object).constructor === Array) {
                    // tslint:disable-next-line:no-any
                    const fOuter = (array: any[]) => {
                        const indexInValue = data[0].length - 1;
                        let lastReturn = 0;
                        return array.map((val, index, arr) => {
                            lastReturn = fInner(val[indexInValue], index, arr, null, lastReturn);
                            val[indexInValue] = lastReturn;
                            return val;
                        });
                    };
                    return fOuter;
                }
            }
        }
        // tslint:disable-next-line:no-any
        return (array: any[]) => array;
    }

    execute(data: DataType[]): DataType[] {
        const f = UserCode.createTransformFunction(data, this.code);
        return f(data);
    }
}
export class Integral extends Transform {
    execute(data: DataType[]): DataType[] {
        let sum = 0;
        const result: DataType[] = [];
        for (var i = 0; i < data.length; i++) {
            const p = data[i];
            sum += p[1];
            result.push([p[0], sum]);
        }
        return result;
    }
}

export class FilterByX extends Transform {
    // ranges: { start: string, end: string }[];
    ranges: [string, string][];
    includeWhenInRange: boolean = false;
    execute(data: DataType[]): DataType[] {
        const parsedRanges = this.ranges.map(r => r.map(d => SimpleDate.parse(d))) as [SimpleDate, SimpleDate][];
        const fIsInRange = DateRange.createMultiGetIsInRangeFunction(parsedRanges);
        const result: DataType[] = [];
        for (var i = 0; i < data.length; i++) {
            const p = data[i];
            const date = new Date(p[0]);
            if (fIsInRange(date) === this.includeWhenInRange) {
                result.push([p[0], p[1]]);
            }
        }
        return result;
    }
}
// https://www.npmjs.com/package/loess
export class LinearRegression extends Transform {
    startDate: number;
    endDate: number;

    execute(data: DataType[]): DataType[] {
        const startDate = this.startDate || data[0][0];
        const endDate = this.endDate || data[data.length - 1][0];

        const len = data.length;
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;
        // let sumYY = 0;

        let inRange = false;
        let startIndex = 0;
        let numPoints = 0;
        for (let i = 0; i < len; i++) {
            const x = data[i][0];
            if (!inRange) {
                if (x >= startDate) {
                    startIndex = i;
                    inRange = true;
                } else {
                    continue;
                }
            } else if (x > endDate) {
                break;
            }
            numPoints++;
            const y = data[i][1];
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumXX += x * x;
            // sumYY += y * y;
        }
        if (numPoints === 0) {
            return [];
        }
        const n = numPoints;
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        // const r2 = Math.pow((n * sumXY - sumX * sumY)
        //     / Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY)),
        //                     2);
        
        const endIndex = startIndex + numPoints - 1;
        // const timespan = (data[endIndex][0] - data[startIndex][0]);
        // const timespanYears = timespan / 1000 / 60 / 60 / 24 / 365.25;
        // const slopePeriod = (data[endIndex][0] - data[startIndex][0]) * slope;
        // const slopePerYear = slopePeriod / timespanYears;
        // console.log("slope over period:" + slopePeriod + ", per decade: " + slopePerYear * 10);
        return [
            [data[startIndex][0], data[startIndex][0] * slope + intercept],
            [data[endIndex][0], data[endIndex][0] * slope + intercept]
        ];
    }
}

export class MovingAverage extends Transform {
    // static WindowFuncGaussian = (x: number) => {
    //    Math.exp(-0.5 * ); // https://github.com/errcw/gaussian/blob/master/lib/gaussian.js
    // };
    static defaultWindow: number[];

    windowLength: number;
    window: number[];

    static WindowFuncTriangle = (x: number) => 1.0 - Math.abs((x - 0.5) / 0.5);
    static WindowFuncRectangle = (x: number) => 1;
    static WindowFuncSin = (x: number) => Math.sin(Math.PI * x * 0.5);

    static createWindowingArray(func: string | Function, length: number) {
        let f: Function;
        if (typeof func === 'string') {
            f = Function('x', 'return ' + func + ';');
        } else {
            f = <Function> func;
        }
        const windowingFactors = [];
        for (let i = 1; i <= length; i++) {
            const x = 1.0 * i / length;
            const aa = f(x);
            windowingFactors.push(aa);
        }
        return windowingFactors;
    }

    static setDefaultWindow(winFuncName: string, length: number) {
        MovingAverage.defaultWindow = MovingAverage.createWindowingArray(MovingAverage.WindowFuncRectangle, length);
    }

    init(winFuncName: string, length: number) {
        this.window = MovingAverage.createWindowingArray(MovingAverage.WindowFuncRectangle, length);
    }

    execute(data: DataType[]): DataType[] {
        let win = this.window;
        if (!win) {
            if (this.windowLength) {
                win = MovingAverage.createWindowingArray(MovingAverage.WindowFuncRectangle, this.windowLength);
            } else {
                win = MovingAverage.defaultWindow;
            }
            if (!win) {
                MovingAverage.setDefaultWindow('Rectangle', 60);
                win = MovingAverage.defaultWindow;
            }
        }
        const result: DataType[] = []; // (Date | number)
        const halfLength = Math.round(win.length / 2);
        const scale = win.reduce((p, c) => p + c); // / windowFactors.length;
        const currentWindow = data.slice(0, win.length).map(_ => <number> _[1]);
        for (let i = currentWindow.length; i < data.length; i++) {
            currentWindow.push(<number> data[i][1]);
            currentWindow.splice(0, 1);
            const val = currentWindow.reduce((p, c, ix) => p + c * win[ix]);
            result.push([data[i - halfLength][0], val / scale]);
        }
        return result;
    }
}

export class TransformLibrary {
    static transforms: Function[];
    static applyTransforms(transforms: TransformSettings[] | undefined, data: DataType[]): DataType[] {
        if (!transforms || !transforms.length) {
            return data;
        }
        const xforms = transforms.map(o => TransformLibrary.getTransform(o));
        // const xform = TransformLibrary.getTransform(
        //     { class: 'MovingAverage', windowLength: 10 }
        //     { class: 'LinearRegression' }  { class: 'UserCode', code: 'value + lastReturn' }
        // );
        xforms.filter(x => !!x).forEach(x => data = (x as Transform).execute(data)); // as Array<[number, number]>
        return data;
    }
    // tslint:disable-next-line:no-any
    static getTransform(info: TransformSettings): Transform | undefined {
        if (!TransformLibrary.transforms) {
            TransformLibrary.transforms = [];
            // TODO: some type of reflection
        }
        // } else {
        let obj: Transform | undefined;
        if (info.class === 'UserCode') {
            obj = new UserCode();
        } else if (info.class === 'MovingAverage') {
            obj = new MovingAverage();
        } else if (info.class === 'LinearRegression') {
            obj = new LinearRegression();
        } else if (info.class === 'Integral') {
            obj = new Integral();
        } else if (info.class === 'FilterByX') {
            obj = new FilterByX();
        // } else if (info.class === 'PeriodicAverage') {
        //     obj = new PeriodicAverage();
        // } else if (info.class === 'ExtendWithTrend') {
        //     obj = new ExtendWithTrend();
        }

        if (obj) {
            Object.assign(obj, info);
            return obj;
        }
        return undefined;
    }
}