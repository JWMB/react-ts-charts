import * as React from 'react';
import { Chart, ChartConfig, MySeriesOptions } from './chart';
import { DataSource } from './dataSource';
import { Collapse } from 'react-collapse';
import { JsonEditor } from './jsonEditor';
import * as stringify from 'json-stringify-pretty-compact';
import { Button } from 'reactstrap';

type ChartDef = ChartConfig;
type Config = {
  sources: { name: string, url: string }[],
  charts: ChartDef[]
};

type State = {
  sources: DataSource[],
  charts: ChartDef[],
  // tslint:disable-next-line:no-any
  configDef: any,
  configDefIsOpen: boolean,
};

export class ChartsAndSources extends React.Component<object, State> {
  componentWillMount() {
    // https://www.esrl.noaa.gov/psd/enso/mei/table.html
    // http://www.remss.com/research/climate/
    // const config = {
    //   sources: [
    //     {
    //       name: 'BEST',
    //       url: 'http://localhost:55734/api/corscheat/?url='
    //         + encodeURIComponent('http://berkeleyearth.lbl.gov/auto/Global/Complete_TAVG_complete.txt'),
    //       xColumn: { name: 'year', type: 'datetime' },
    //       parser: 'BerkeleyBEST'
    //     },
    //     {
    //       name: 'SeaLevel',
    //       url: 'http://localhost:55734/api/corscheat/?url='
    //         + encodeURIComponent('http://sealevel.colorado.edu/files/2016_rel4/sl_ns_global.txt'),
    //       xColumn: { name: 'year', type: 'datetime' },
    //     },
    //     {
    //       name: 'Temp',
    //       url: 'http://localhost:55734/api/corscheat/?url='
    //         //  'C:\\Users\\jonas\\Documents\\GraphPlay\\graphplayorg\\data\\NASA_GSMTMonthly2015.txt'),
    //         + encodeURIComponent('https://data.giss.nasa.gov/gistemp/tabledata_v3/GLB.Ts+dSST.txt'),
    //       xColumn: { name: 'year', type: 'datetime' },
    //       parser: 'MonthAsColumn'
    //     },
    //   ],
    //   charts: [
    //     {
    //       title: { text: 'Climate data' },
    //       yAxis: [{
    //         title: { text: 'Temp. anomaly NASA GIS', style: { color: 'colors[0]' } },
    //         labels: { format: '{value}°C', style: { color: 'colors[0]' } }
    //     }, {
    //         gridLineWidth: 0,
    //         title: { text: 'Temp. anomaly BEST', style: { color: 'colors[1]' } },
    //         labels: { format: '{value}°C', style: { color: 'colors[1]' } },
    //         opposite: true
    //     }, {
    //       gridLineWidth: 0,
    //       title: { text: 'Sea level', style: { color: 'colors[2]' } },
    //       labels: { format: '{value} mm', style: { color: 'colors[2]' } },
    //       opposite: true
    //     }],
    //       series: [
    //         {
    //           sourceRef: 'Temp::Value', name: 'NASA GIS', lineWidth: 1, shadow: true,
    //           transforms: [
    //             { class: 'UserCode', code: 'value / 100' },
    //             { class: 'MovingAverage', windowLength: 10 }
    //           ]
    //         },
    //         {
    //           sourceRef: 'BEST::Value', name: 'BEST', lineWidth: 1, shadow: true, yAxis: 1,
    //           transforms: [
    //             { class: 'FilterByX', ranges: [['1880-01-01', '2020-01-01']], includeWhenInRange: true },
    //             // { class: 'UserCode', code: 'value * 50' },
    //             { class: 'MovingAverage', windowLength: 10 }
    //           ]
    //         },
    //         {
    //           sourceRef: 'SeaLevel::msl_ib_ns(mm)', name: 'Sea level', lineWidth: 1, shadow: true, yAxis: 2,
    //           transforms: [
    //             { class: 'MovingAverage', windowLength: 10 }
    //           ]

    //         }

    //       ]
    //     }
    //   ]
    // };

    const config = {
      sources: [
        {
          name: 'CMDB',
          url: 'http://localhost:55734/api/azure/cache',
          xColumn: { name: 'Date', type: 'datetime' },
          series: [
            {
              column: 'Syncs_onlySchools=true',
              transforms: []
            }
          ]
        }
      ],
      charts: [
        {
          title: 'Syncs',
          defaultSource: 'CMDB',
          yAxis: {
            title: {
              text: 'Number of accounts'
            }
          },
          series: [
            {
              sourceRef: 'Syncs_onlySchools=true', name: 'Daily school syncs avg', color: '#ffccaa',
              transforms: [{ class: 'MovingAverage', windowLength: 10 }]
            },
            { sourceRef: 'Syncs_onlySchools=true', name: 'Daily school syncs' },
            { sourceRef: 'Syncs_onlySchools=false', name: 'Daily total syncs' },
            { sourceRef: 'UniqueSyncsPerWeek', name: 'Weekly unique syncs', lineWidth: 0 },
            {
              sourceRef: 'UniqueSyncsPerWeek', name: 'Weekly unique syncs, exl holidays', lineWidth: 0,
              transforms: [{
                class: 'FilterByX', ranges: [
                  ['??-03-23', '??-04-15'], ['??-06-01', '??-09-15'],
                  ['??-10-20', '??-11-02'], ['??-12-15', '??-01-15']]
              }]
            },
            {
              sourceRef: 'UniqueSyncsPerWeek', name: 'Weekly unique syncs exl trend',
                transforms: [{
                  class: 'FilterByX', ranges: [
                    ['??-03-23', '??-04-15'], ['??-06-01', '??-09-15'],
                    ['??-10-20', '??-11-02'], ['??-12-15', '??-01-15']]
                },
              { class: 'LinearRegression' }]
            }
          ]
        },
        {
          title: 'Accumulated created/started accounts',
          defaultSource: 'CMDB',
          yAxis: {
            title: {
              text: 'Number of accounts'
            }
          },
          series: [
            {
              sourceRef: 'NewTrainingAccounts_parents=true', name: 'Created (parents)',
              transforms: [{ class: 'Integral' }]
            },
            {
              sourceRef: 'NewTrainingAccounts_parents=false', name: 'Created (total)',
              transforms: [{ class: 'Integral' }]
            },
            {
              sourceRef: 'FirstSyncs', name: 'Started',
              transforms: [{ class: 'Integral' }]
            }
          ]
        },
        {
          title: 'Created/started accounts',
          yAxis: {
            title: {
              text: 'Number of accounts'
            }
          },
          series: [
            { sourceRef: 'CMDB::NewTrainingAccounts_parents=true', name: 'Created (parents)' },
            { sourceRef: 'CMDB::NewTrainingAccounts_parents=false', name: 'Created (total)' },
            { sourceRef: 'CMDB::FirstSyncs', name: 'Started' }
          ]
        }
      ] as ChartDef[]
    };

    // TODO: PR to json-stringify-pretty-compact ?
    let configAsString = stringify(config, { maxLength: 80, indent: 2 });
    const rxEmptyBracketLine = /(\n\s*)({)(\s*\n\s*)/g;
    while (true) {
      const matches = rxEmptyBracketLine.exec(configAsString);
      if (!matches || !matches.length) {
        break;
      }
      if (matches.length === 4) {
        const index = matches.slice(1, 2).map(m => m.length).reduce((p, c) => p + c);
        configAsString = configAsString.substr(0, matches.index + index) + '{ '
          + configAsString.substr(matches.index + matches[0].length);
      }
    }
    this.setState({
      configDef: configAsString,
      // configDef: JSON.stringify(config, null, ' '), // .replace(/\n/g, '<br>'),
      configDefIsOpen: false, // chartsDefWarnings: '',
      sources: []
    });
  }
  componentDidMount() {
    this.handleSubmitChartsDef(this.state.configDef);
  }

  render() {
    let listItems: JSX.Element[] = [];
    if (this.state.charts && this.state.charts.length) {
      listItems = this.state.charts.map(item => {
        const copy = Object.assign({}, item);
        if (copy.series) {
          copy.series.forEach(s => {
            const parts = s.sourceRef.split('::');
            const sourceName = parts.length > 1 ? parts[0] : item.defaultSource;
            if (sourceName) {
              s.source = this.state.sources.find(o => o.url === sourceName || o.name === sourceName) as DataSource;
            }
          });
          copy.series = copy.series.filter(s => !!s.source);
        }
        return copy;
      })
        .filter((c: ChartConfig) => c.series && c.series.length)
        .map((c: ChartConfig) => (
          <li key={c.title}>
            <Chart config={c} />
          </li>
        ));
    }
    if (!listItems.length) {
      listItems =
        [(
          <li key="0">
            loading...
          </li>
        )];
    }
    // const listItems = this.state.charts ? 
    //   return (
    //     <li key={item.title}>
    //       <Chart config={copy}/>
    //     </li>
    //   );
    // }) :
    //   [(
    //     <li key="0">
    //     loading...
    //     </li>
    //   )];

    return (
      <div>
        <div>
          <div>Sources/charts definition</div>
          <Button onClick={this.handleToggleClick}>
            {this.state.configDefIsOpen ? 'close' : 'open'}
          </Button>
          <Collapse isOpened={this.state.configDefIsOpen}>
            <JsonEditor onSubmit={this.handleSubmitChartsDef} data={this.state.configDef} />
          </Collapse>
        </div>
        <ul>
          {listItems}
        </ul>
      </div>
    );
  }

  private handleToggleClick = () => this.toggleChartsDef();
  private toggleChartsDef() {
    this.setState(ps => ({ configDefIsOpen: !ps.configDefIsOpen }));
  }

  private handleSubmitChartsDef = (data: string) => {
    const dataObj = JSON.parse(data);
    this.submitConfigDef(dataObj as Config);
    // try {
    //   const dataObj = JSON.parse(this.state.chartsDef);
    //   this.submitChartsDef(dataObj as ChartsDef[]);
    // } catch (err) {
    //   this.setState({ chartsDefWarnings: '' + err });
    // }
  }

  private submitConfigDef(config: Config) {
    const newSourceDefs = config.sources.filter(s => !this.state.sources.find(o => o.name === s.name));
    let newSources: DataSource[] = [];
    newSources = newSources.concat(newSourceDefs.map(o => {
      const ds = Object.assign(new DataSource(), o);
      return ds;
    }));

    const checkSources = this.state.sources.concat(newSources);

    const sourcesFromChartsDefNested = config.charts
      .filter(c => !!c.series)
      .map(c => (c.series as MySeriesOptions[])
        .map(s => {
          const parts = s.sourceRef.split('::');
          return parts.length > 1 ? parts[0] : null;
        })
        .filter(s => !!s)
      );
    let sourcesFromChartsDef: string[] = [].concat.apply([], sourcesFromChartsDefNested);
    sourcesFromChartsDef = sourcesFromChartsDef.concat(
      config.charts.map(c => c.defaultSource).filter(c => !!c));
    sourcesFromChartsDef = sourcesFromChartsDef.filter((value, index, self) => self.indexOf(value) === index);

    // const sourcesFromChartsDef = config.charts.map(o => o.source as string)
    //   .filter((value, index, self) => self.indexOf(value) === index);
    const newSourceRefs = sourcesFromChartsDef.filter(s => !checkSources.find(o => s === o.url || s === o.name));
    newSources = newSources.concat(newSourceRefs.map(o => Object.assign(new DataSource(), { url: o as string})));
    
    let sources = this.state.sources.concat(newSources);
    this.setState({ sources: sources });
    const promises = newSources.map(s => s.load());
    Promise.all(promises).then(vals => {
      this.setState({ charts: config.charts });
    },                         err => alert('' + err));
  }    

}
