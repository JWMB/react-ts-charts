import { default as axios } from 'axios';
import { Signal } from 'micro-signals';
import { TransformSettings } from './transform';

export type DataSeries = {
    name: string,
    format: 'number' | 'string',
    isXValues: boolean,
    data: Array<number | string>
};

export interface SourceParser {
    parse(data: string): DataSeries[];
}
export class BerkeleyBESTParser implements SourceParser {
    parse(data: string): DataSeries[] {
        const rows = data.split('\n').map(o => o.split(' ').filter(o2 => o2.length > 0))
            .filter(o => o.length > 0).filter(o => parseFloat(o[0]).toString() === o[0]);
        const result = Array.from(Array(2)).map(o =>
            (<DataSeries> { name: '', format: 'number', data: [], isXValues: false }));
    
        result[0].isXValues = true;
        result[0].name = 'Date';
        result[1].name = 'Value';

        rows.forEach(row => {
            const date = new Date(parseFloat(row[0]), parseFloat(row[1]) - 1, 1);
            result[0].data.push(date.valueOf());
            result[1].data.push(parseFloat(row[2]));
         });
        return result;
    }
}
export class MonthAsColumnParser implements SourceParser {
    parse(data: string): DataSeries[] {
        const rows = data.split('\n').map(o => o.split(' ').filter(o2 => o2.length > 0))
            .filter(o => o.length > 0).filter(o => parseFloat(o[0]).toString() === o[0]);
        const result = Array.from(Array(2)).map(o =>
            (<DataSeries> { name: '', format: 'number', data: [], isXValues: false }));
        result[0].isXValues = true;
        result[0].name = 'Date';
        result[1].name = 'Value';
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            for (let j = 0; j < 12; j++) {
                const date = new Date(parseFloat(row[0]), j, 1);
                result[0].data.push(date.valueOf());
                result[1].data.push(parseFloat(row[j + 1]));
            }
        }
        return result;
    }
}
export class CSVSourceParser implements SourceParser {
    static guessFormat(data: string) {
        // const lines = data.split('\n');
        // look for year column
        const thisYear = new Date(Date.now()).getFullYear();
        const foundYears = Array.from(Array(10)).map(v => thisYear - v * 5)
            .map(v => ({ year: v, index: data.lastIndexOf('' + v), previousNLIndex: -1, line: '' }))
            .filter(v => v.index >= 0)
            .reverse();
        
        foundYears.forEach(v => {
            v.previousNLIndex = data.lastIndexOf('\n', v.index);
            const nextNL = data.indexOf('\n', v.index);
            v.line = data.substring(v.previousNLIndex, nextNL < 0 ? data.length : nextNL);
        });
        return foundYears;
    }
    parse(data: string): DataSeries[] {
        const rows = data.substr(0, data.indexOf('\n')).indexOf('\t') >= 0 ?
            data.split('\n').map(o => o.split('\t')) :
            data.split('\n').map(o => o.split(' ').filter(o2 => o2.length !== 0));
             // [\t|\s*]
        const series = rows[0].map(o => (<DataSeries> { name: o, format: 'number', data: [], isXValues: false }));
        rows.slice(1).forEach(row => row.forEach((v, i) => series[i].data.push(v)));
        return series;
    }
}

export class DataSource {
    name: string;
    description: string;
    url: string;
    xColumn: { name: string, type: 'datetime' | 'time' | 'number' };
    series: { column: string, transforms: TransformSettings[] }[];
    dataSeries: DataSeries[];
    parser: string;

    loadedSignal = new Signal<boolean>();

    constructor() { // private parser: string
    }
    
    load() { // url?: string
        this.dataSeries = [];
        const url = this.url;
        return new Promise<void>((res, rej) => {
            axios.get(<string> url).then(
                axResult => {
                    let parser: SourceParser;
                    switch (this.parser) {
                        case 'MonthAsColumn':
                            parser = new MonthAsColumnParser();
                            break;
                        case 'BerkeleyBEST':
                            parser = new BerkeleyBESTParser();
                            break;
                        default:
                            parser = new CSVSourceParser();
                    }
                    this.dataSeries = parser.parse(axResult.data);
                    if (this.xColumn && this.xColumn.name) {
                        const xValSeries = this.dataSeries.find(o => o.name === this.xColumn.name);
                        if (xValSeries) {
                            xValSeries.isXValues = true;
                            if (this.xColumn.type === 'datetime') {
                                // TODO: auto-detect format!
                                if ((xValSeries.data[0] as string).indexOf('.') === 4) {
                                    xValSeries.data = xValSeries.data.map((v: string) => {
                                        const dayInYear = 365 * parseFloat('0.' + v.substr(5));
                                        const date = new Date(parseFloat(v.substr(0, 4)), 0, 1);
                                        date.setDate(dayInYear);
                                        return date.valueOf();
                                    });
                                } else {
                                    xValSeries.data = xValSeries.data.map((v: string) => Date.UTC(
                                        parseFloat('20' + v.substr(0, 2)),
                                        parseFloat(v.substr(2, 2)) - 1,
                                        parseFloat(v.substr(4, 2))).valueOf());
                                }
                            }    
                    
                        }
                    }
                    res();
                },
                err => {
                    rej(err);
                }
            ).then(() => this.loadedSignal.dispatch(this.dataSeries.length > 0));
        });
    }

    // xxx(sources: DataSource[]) {
    //     const def = {
    //         name: 'Aggregated',
    //         series: [
    //             {
    //                 source: 'CMDB',
    //                 series: 'Syncs_onlySchools=true',
    //                 name: 'Schools',
    //                 transforms: [{ class: 'Integral' }]
    //             }
    //         ]
    //     };
    //     // called after all external data has been loaded
    //     // this.dataSeries
    // }
}