import { default as axios } from 'axios';
import { Signal } from 'micro-signals';
import { TransformSettings } from './transform';
import { MonthAsColumnParser } from './sourceParsers/monthAsColumnParser';
import { BerkeleyBESTParser } from './sourceParsers/berkeleyBESTParser';
import { CSVParser } from './sourceParsers/CSVParser';
import { DateFormat } from './dateRange';

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
    series: { column: string, transforms: TransformSettings[] }[];
    dataSeries: DataSeries[];
    parser: string;

    loadedSignal = new Signal<boolean>();
    
    load() {
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
                    res();
                },
                err => {
                    rej(err);
                }
            ).then(() => this.loadedSignal.dispatch(this.dataSeries.length > 0));
        });
    }
}