import { default as axios } from 'axios';
import { CSVParser } from './sourceParsers/CSVParser';
import { DateFormat } from './dateRange';

// import { DateRange, MyDate } from './dateRange';
export class DryRun {
    // while waiting for jest to start working again...
    static tests() {
        DryRun.dateFormats();
    }
    static dateFormats() {
        const f = (format: string, dateString: string, verifyDate: Date) => {
            const parser = DateFormat.getDateParser(format);
            if (!parser) {
                return 'No parser';
            }
            const date = parser(dateString);
            if (date.valueOf() === verifyDate.valueOf()) {
                return 'OK';
            }
            return 'Not equal:' + date.toUTCString() + ' ' + verifyDate.toUTCString();
        };
        [
            ['yyyy-mm-dd', '1983-10-12', new Date(Date.UTC(1983, 9, 12))],
            ['yymmdd', '731012', new Date(Date.UTC(1973, 9, 12))],
            ['dd/mm-yy', '12/10-73', new Date(Date.UTC(1973, 9, 12))]
        ].forEach(l => {
            const r = f(<string> l[0], <string> l[1], <Date> l[2]);
            if (r !== 'OK') {
                // tslint:disable-next-line:no-console
                console.log(r);
            }
        });    }
    static dateRange() {
        // const f = DateRange.createGetIsInRangeFunction(MyDate.parse('xx-12-01'), MyDate.parse('xx-01-15'));
        // f(new Date(2000, 11, 15));
    }
    static guessCSVFormat() {
        // https://data.giss.nasa.gov/gistemp/tabledata_v3/GLB.Ts+dSST.txt
        // http://berkeleyearth.lbl.gov/auto/Global/Complete_TAVG_complete.txt
        axios.get('https://www.esrl.noaa.gov/psd/enso/mei/table.html').then(response => {
            CSVParser.guessFormat(response.data);
        });
    }
}