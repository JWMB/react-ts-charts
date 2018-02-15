import * as React from 'react';
// import * as rDom from 'react-dom';
import * as hs from 'highcharts';
import * as ReactHighcharts from 'react-highcharts';
import { DataSource } from './dataSource';
import * as color from 'color';
import { TransformSettings, TransformLibrary } from './transform'; // ,
// TODO: doesn't work, __WEBPACK_IMPORTED_MODULE_5_deepmerge__ is not a function
// import * as deepmerge from 'deepmerge';

export interface MySeriesOptions extends hs.SeriesOptions {
    sourceRef: string;
    source: DataSource;
    transforms?: TransformSettings[];
}
export interface ChartConfig {
    // source: DataSource | string;
    defaultSource: string;
    title?: string;
    series?: MySeriesOptions[]; // { id: string, name: string }
    xAxis?: hs.AxisOptions;
    yAxis?: hs.AxisOptions | hs.AxisOptions[];
}
type Props = {
    config: ChartConfig
    // // dataUrl?: string,
    // source: DataSource,
    // title?: string,
    // series?: MySeriesOptions[] // { id: string, name: string }
    // xAxis?: hs.AxisOptions;
    // yAxis?: hs.AxisOptions;
};
type State = {
    fetched: boolean,
    error: string | null,
    data: number[][],
    series: hs.SeriesOptions[]
};

class WhileWaitingForDeepMerge {
    // tslint:disable-next-line:no-any
    static isObject(item: any): boolean {
        return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
    }
    // tslint:disable-next-line:no-any
    static mergeDeep(target: any, source: any) {
        if (WhileWaitingForDeepMerge.isObject(target) && WhileWaitingForDeepMerge.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (WhileWaitingForDeepMerge.isObject(source[key])) {
                    if (!target[key]) {
                        Object.assign(target, { [key]: {} });
                    }
                    WhileWaitingForDeepMerge.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            });
        }
        return target;
    }
}

export class Chart extends React.Component<Props, State> {
    componentWillMount() {
        this.setState({ fetched: false, error: null, data: [], series: [] });
    }

    createHighChartSeries(seriesDefs: MySeriesOptions[] = []) {
         // { id: string, name: string }
        // const dateSeriesPerSource: { [key: string]: number[]} = { };
        const all = seriesDefs.map(seriesDef => {
            const findSeriesBy = seriesDef.sourceRef.indexOf('::') > 0
                ? seriesDef.sourceRef.split('::')[1]
                : seriesDef.sourceRef;
            const seriesRef = seriesDef.source.dataSeries.find(series => series.name === findSeriesBy);
            if (seriesRef && seriesRef.data) {
                const dateSeries = seriesDef.source.dataSeries.find(o => o.isXValues);
                if (dateSeries && dateSeries.data) {
                    const orgData = seriesRef.data as string[];
                    //     dateSeriesPerSource[seriesDef.source.name]
                    const data = orgData.map((v: string, i: number) =>
                        v ? ([dateSeries.data[i], parseFloat(v)]) : null);
                    // tslint:disable-next-line:no-any
                    const series = Object.assign({}, seriesDef);
                    Object.assign(series, { data: data.filter(o => !!o) });
                    series.data = TransformLibrary.applyTransforms(
                        series.transforms, series.data as [number, number][]) as Array<[number, number]>;
                    return series;
                }
            }    
            return null;
        });
        this.setState({ fetched: true, series: all.filter(s => !!s) as MySeriesOptions[] });
        // const dateSeries = ds.dataSeries.find(o => o.isXValues); //  === 'Date'
        // if (dateSeries) {
        //     const all = seriesDefs
        //         .map(o => ({ def: o, ref: ds.dataSeries.find(series => series.name === o.sourceRef) }))
        //         .filter(o => !!o.ref).map(defref => {
        //             if (!defref.ref) {
        //                 return {} as MySeriesOptions;
        //             }
        //             const data = defref.ref.data.map((v: string, i) =>
        //                 v ? ([dateSeries.data[i], parseFloat(v)]) : null);
        //             // tslint:disable-next-line:no-any
        //             const seriesDef = Object.assign({ name: defref.ref.name }, defref.def);
        //             // const seriesDef = Object.assign(
        //             //     { name: defref.def.name } as MySeriesOptions, // data: [] as any[]
        //             //     defref.ref); // seriesDefs.find(sd => sd.sourceRef === series.name) || {});
        //             Object.assign(seriesDef, { data: data.filter(o => !!o) });
        //             seriesDef.data = TransformLibrary.applyTransforms(
        //                 seriesDef.transforms, seriesDef.data as [number, number][]) as Array<[number, number]>;
        //             return seriesDef;
        //         });
        //     this.setState({ fetched: true, series: all });
        // }
    }
    setupColors() {
        let colors = Array.from(new Array(7)).map((v, i, arr) => color.hsv(i / arr.length * 360, 60, 80));
        colors = colors.concat(colors.map(v => v.darken(0.2))); // blacken
        hs.setOptions({
            colors: colors.map(v => v.rgb().toString())
            // colors: ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572',
            //  '#FF9655', '#FFF263', '#6AF9C4']
        });
    }

    prepareSeries(props: Props) {
        if (props.config.series) {
            // TODO: need tp be able to wait for some/all sources to load
            // progressive loading - display series as their sources become available?
            // props.config.series.map(s => {
            //     const srcAndSeries = s.sourceRef.split('::');
            //     if (s.source.dataSeries.length) {
            //     }
            // });
            this.createHighChartSeries(props.config.series);
        }
        // if (props.config.source) {
        //     if (typeof props.config.source === 'object') {
        //         if (props.config.source.dataSeries.length) {
        //             this.createHighChartSeries(props.config.source, props.config.series);
        //         } else {
        //             props.config.source.loadedSignal.addOnce(gotData =>
        //                 this.createHighChartSeries(props.config.source as DataSource, props.config.series));
        //         }
        //     }
        // }
    }
    componentDidMount() { // componentWillUpdate
        this.setupColors();
        this.prepareSeries(this.props);
    }
    componentWillReceiveProps(nextProps: Props) {
        this.prepareSeries(nextProps);
    }
    componentDidUpdate() {
        // TODO: this.refs.chart type? ReactInstance hs.Chart?
        // tslint:disable-next-line:no-any
        const chart = (this.refs.chart as any).getChart() as hs.ChartObject;
        if (chart) {
            chart.yAxis.forEach(axis => {
                const extremes = axis.getExtremes();
                const axisRange = (extremes.max - extremes.min);
                const dataRange = (extremes.dataMax - extremes.dataMin);
                const ratio = dataRange / axisRange;
                // TODO: expand range when too small.
                // TODO: Can tickPositioner be a better way that to calc this post - render ?
                if (ratio < 0.0) {
                    // const newExtremes = { min: extremes.min, max: extremes.max };
                    axis.setExtremes(extremes.min * 0.6, extremes.max * 0.6);
                }
            });
        }
    }
    render() {
        this.setupColors();

        const ref = 'chart';
        // const defaultSeriesConfig: hs.SeriesOptions = {
        // };
        let config = {
            title: {
                text: this.props.config.title || 'Unnamed chart'
                // `Fetched? ${this.state.fetched}` + (this.state.error ? '' + this.state.error : '')
            },
            // subtitle: { text: 'Source: thesolarfoundation.com' },
            xAxis: {
                type: 'datetime'
            },
            yAxis: [
                { title: { text: 'N/A' } } as hs.AxisOptions
            ],
            legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom'
                // layout: 'vertical',
                // align: 'right',
                // verticalAlign: 'middle'
            },
            plotOptions: {
                series: {
                    animation: false,
                    label: {
                        connectorAllowed: false
                    },
                    pointStart: 2010
                }
            },
            series: [
                {
                    type: 'area',
                    name: 'USD to EUR',
                    data: this.state.data
                }
            ] as hs.SeriesOptions[],
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }
        };
        const fGetColorFromStrRef = (str: string) => {
            if (hs.getOptions().colors) {
                const clrs = hs.getOptions().colors as hs.Color[];
                const m = /\d+/.exec(str);
                if (m) {
                    const index = parseFloat(m[0]);
                    if (!isNaN(index) && index >= 0 && index < clrs.length) {
                        return clrs[index];
                    }
                }
            }
            return '#ff0000';
        };
        const configCopy = Object.assign({}, this.props.config);
        if (configCopy.yAxis) {
            if (configCopy.yAxis.constructor !== Array) {
                configCopy.yAxis = [configCopy.yAxis] as hs.AxisOptions[];
            }
            (configCopy.yAxis as hs.AxisOptions[]).forEach(ax => {
                if (ax.title && ax.title.style && ax.title.style.color
                    && typeof ax.title.style.color === 'string' && ax.title.style.color.indexOf('colors[') === 0) {
                    ax.title.style.color = fGetColorFromStrRef(ax.title.style.color);
                }
                if (ax.labels && ax.labels.style && ax.labels.style.color
                    && typeof ax.labels.style.color === 'string' && ax.labels.style.color.indexOf('colors[') === 0) {
                        ax.labels.style.color = fGetColorFromStrRef(ax.labels.style.color);
                }
            });
        }
        if (configCopy.title && typeof configCopy.title === 'string') {
            delete configCopy.title;
        }
        WhileWaitingForDeepMerge.mergeDeep(config, configCopy);

        if (this.state.series && this.state.series.length) {
            config.series = this.state.series; // .map(o => Object.assign())
        }

        return (
            <div>
                <ReactHighcharts config={config} ref={ref} />
                {this.state.error}
                {/* {this.props.series ? this.props.series.map(s => s.name).join(',') : ''} */}
            </div>
        );
    }
}