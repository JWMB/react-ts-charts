import { default as axios } from 'axios';
import { CSVSourceParser } from './dataSource';

// import { DateRange, MyDate } from './dateRange';
export class DryRun {
    // while waiting for jest to start working again...
    static dateRange() {
        // const f = DateRange.createGetIsInRangeFunction(MyDate.parse('xx-12-01'), MyDate.parse('xx-01-15'));
        // f(new Date(2000, 11, 15));
    }
    static guessCSVFormat() {
        // https://data.giss.nasa.gov/gistemp/tabledata_v3/GLB.Ts+dSST.txt
        // http://berkeleyearth.lbl.gov/auto/Global/Complete_TAVG_complete.txt
        axios.get('https://www.esrl.noaa.gov/psd/enso/mei/table.html').then(response => {
            CSVSourceParser.guessFormat(response.data);
        });
    }
}