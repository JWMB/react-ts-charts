import * as React from 'react';
import { Chart, ChartConfig, MySeriesOptions } from './chart';
import { DataSource } from './dataSource';
// import { Collapse } from 'react-collapse';
// import { JsonEditor } from './jsonEditor';
// import { Button } from 'reactstrap';
// import * as chartConfig from './assets/climate.chartsource.json';
// import { stringify2 } from './stringify2';
// import * as editorSchema from './editorSchema.json';

type ChartDef = ChartConfig;
type Config = {
  sources: { name: string, url: string }[],
  charts: ChartDef[]
};

type Props = {
  configDef: string
};

type State = {
  sources: DataSource[],
  charts: ChartDef[],
  // configDef: string,
  // configDefIsOpen: boolean,
};

export class ChartsAndSources extends React.Component<Props, State> {
  componentWillMount() {
    // https://www.esrl.noaa.gov/psd/enso/mei/table.html
    // http://www.remss.com/research/climate/

    // let configAsString = stringify2(chartConfig, { maxLength: 80, indent: 2 });
    this.setState({
      // configDef: configAsString,
      // configDefIsOpen: false,
      sources: []
    });
  }
  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.configDef !== this.props.configDef) {
      this.handleSubmitChartsDef(nextProps.configDef);
    }
  }
  componentDidMount() {
    this.handleSubmitChartsDef(this.props.configDef);
    // this.handleSubmitChartsDef(this.state.configDef); // JSON.parse(
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
          <div key={c.title}>
            <Chart config={c} />
          </div>
        ));
    }
    if (!listItems.length) {
      listItems =
        [(
          <div key="0">
            loading...
          </div>
        )];
    }

    return (
      <div>
        <div>
          <div>Sources/charts definition</div>
          {/* <Button onClick={this.handleToggleClick}>
            {this.state.configDefIsOpen ? 'close' : 'open'}
          </Button>
          <Collapse isOpened={this.state.configDefIsOpen}>
            <JsonEditor onSubmit={this.handleSubmitChartsDef} data={this.state.configDef} schema={editorSchema} />
          </Collapse> */}
        </div>
        <div>
          {listItems}
        </div>
      </div>
    );
  }

  // private handleToggleClick = () => this.toggleChartsDef();
  // private toggleChartsDef() {
  //   this.setState(ps => ({ configDefIsOpen: !ps.configDefIsOpen }));
  // }

  private handleSubmitChartsDef = (data: string) => { // Object | Array<Object>
    this.submitConfigDef(JSON.parse(data) as Config);
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
    Promise.all(promises).then(
      vals => {
        this.setState({ charts: config.charts });
      },
      err => alert('' + err));
  }    

}
