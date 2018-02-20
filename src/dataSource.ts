import { default as axios } from 'axios';
import { Signal } from 'micro-signals';
import { TransformSettings } from './transform';
import { MonthAsColumnParser } from './sourceParsers/monthAsColumnParser';
import { BerkeleyBESTParser } from './sourceParsers/berkeleyBESTParser';
import { CSVParser } from './sourceParsers/CSVParser';
import { DateFormat } from './dateRange';
import { SMHIMinMaxParser } from './sourceParsers/SMHIMinMaxParser';
import { EnvHelper } from './envHelper';

export type DataSeries = {
    name: string,
    format: 'number' | 'string',
    isXValues: boolean,
    data: Array<number | string>
};

export interface SourceParser {
    parse(data: string): DataSeries[];
}

export class DataSource {
    name: string;
    description: string;
    url: string;
    xColumn: { name: string, type: 'datetime' | 'time' | 'number' };
    series: { name: string, transforms: TransformSettings[] }[];
    dataSeries: DataSeries[];
    parser: string;

    loadedSignal = new Signal<boolean>();
    
    load() {
        this.dataSeries = [];
        const url = EnvHelper.replaceInString(this.url);
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
                        case 'SMHIMinMax':
                            parser = new SMHIMinMaxParser();
                            break;
                        default:
                            parser = new CSVParser();
                    }
                    this.dataSeries = parser.parse(axResult.data);
                    if (this.xColumn && this.xColumn.name) {
                        const xValSeries = this.dataSeries.find(o => o.name === this.xColumn.name);
                        if (xValSeries) {
                            xValSeries.isXValues = true;
                            if (this.xColumn.type === 'datetime') {
                                const dateParser = DateFormat.getDateParser(
                                    DateFormat.guessDateFormat(xValSeries.data[0] as string));
                                if (dateParser) {
                                    xValSeries.data = xValSeries.data.map((v: string) => dateParser(v).valueOf());
                                }
                            }    
                    
                        }
                    }
                    if (this.series) {
                        // TODO: just for testing, no design yet for multiplexing / demultiplexing
                        this.series.forEach(s => {
                            this.muxDemux(s);
                         });
                    }
                    res();
                },
                err => {
                    rej(err);
                }
            ).then(() => this.loadedSignal.dispatch(this.dataSeries.length > 0));
        });
    }

    // tslint:disable-next-line:no-any
    muxDemux(s: { name: string, transforms: any[]}) {
        // tslint:disable-next-line:no-any
        const muxDemux = <any[]>(<any>s).muxDemux;
        if (muxDemux) {
            muxDemux.forEach(x => {
                let added: DataSeries[] = [];
                if (x.class === 'demux') {
                    added = this.demuxByYear(this.dataSeries[1], this.dataSeries[0]);
                } else if (x.class === 'join') {
                    const inputNames: string[] = x.inputs;
                    const inputs = this.dataSeries.filter(ds => inputNames.indexOf(ds.name) >= 0);
                    if (inputs.length !== inputNames.length) {
                        // tslint:disable-next-line:no-console
                        console.log('series not found...', inputNames, this.dataSeries.map(ds => ds.name));
                    }
                    added = this.joinSeries(inputs);
                    added[0].name = s.name;
                }
                this.dataSeries = this.dataSeries.concat(added);
            });
        }
    }
    joinSeries(valueSeries: DataSeries[]) {
        const added = <DataSeries>{  name: 'joined', data: <number[]>[], format: 'number'};
        const len = Math.max.apply(null, valueSeries.map(s => s.data.length));
        for (let i = 0; i < len; i++) {
            let val = valueSeries.map(s => parseFloat(<string>s.data[i]))
                .reduce((p, c) => p + (c || 0));
            added.data.push(val);
        }
        return [added];
    }
    demuxByYear(valueSeries: DataSeries, dateSeries: DataSeries) {
        // TODO: so bad... corrupts original dateSeries
        const yearArray = Array.from(Array(366)).map(_ => null);
        const split = new Map<number, (number | null)[]>();
        valueSeries.data.forEach((v, i) => {
            const a = dateSeries.data[i];
            const date = new Date(a as number);
            const year = date.getFullYear();
            let subSeries = split.get(year);
            if (!subSeries) {
                // subSeries = [];
                subSeries = yearArray.slice();
                split.set(year, subSeries);
            }
            const dayOfYear = new Date(Date.UTC(2000, date.getMonth(), date.getDate())).getDateOfYear();
            subSeries[dayOfYear] = v as number;
            // date.setDate(dayInYear);
            // dateSeries.data[i] = new Date(Date.UTC(2000, date.getMonth(), date.getDate())).valueOf();
            // subSeries.push(v as number);
        });
        dateSeries.data = yearArray.map((v, i) => {
            const d = new Date(Date.UTC(2000, 0, 1));
            d.setDate(i + 1);
            return d.valueOf();
        });
        const added = <DataSeries[]>[];
        split.forEach((value, key, series) => {
            added.push(<DataSeries>{ name: '' + key, data: value, format: 'number' });
        });
        return added;
    }
}