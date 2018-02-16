import { SourceParser, DataSeries } from '../dataSource';

export class CSVParser implements SourceParser {
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
