import { SourceParser, DataSeries } from '../dataSource';
import { DateFormat } from '../dateRange';

// tslint:disable-next-line:max-line-length
// 1976-08-31 18:00:01;1976-09-01 18:00:00;1976-09-01;0.0;G;16.6;G;;Kvalitetskontrollerade historiska data (utom de senaste 3 mån)
// tslint:disable-next-line:max-line-length
// Från Datum Tid (UTC);Till Datum Tid (UTC);Representativt dygn;Lufttemperatur;Kvalitet;Lufttemperatur;Kvalitet;;Tidsutsnitt:

export class SMHIMinMaxParser implements SourceParser {
    parse(data: string): DataSeries[] {
        const rows = data.split('\n').filter(l => !!l).map(l => l.split(';'));

        const result = Array.from(Array(2)).map(o =>
            (<DataSeries> { name: '', format: 'number', data: [], isXValues: false }));
    
        result[0].isXValues = true;
        result[0].name = 'Date';
        result[1].name = 'Value';

        const dateParser = DateFormat.getDateParserCanThrow('yyyy-mm-dd'); // row[2]
        for (let i = rows.length - 1; i >= 0; i--) {
            const row = rows[i];
            const first4 = row[0].substr(0, 4);
            if (parseFloat(first4).toString() === first4) {
                result[0].data.push(dateParser(row[2]).valueOf());
                result[1].data.push(parseFloat(row[5]));
            } else {
                break;
            }
        }
        result.forEach(r => r.data = r.data.reverse());
        return result;
    }
}