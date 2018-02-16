import { SourceParser, DataSeries } from '../dataSource';

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