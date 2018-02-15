// import * as hs from 'highcharts';

// export interface Interface1 {
//     aStringOrNumber: number | string;
//     myAnimal: Animal;
// }
// export class Animal {
//     name: string;
// }

// export class Vertebrae extends Animal {
//     numLegs: number;
// }

// export class Cat extends Vertebrae {
//     numLegs = 4;
//     canMeow = true;
// }

// export class MyAnimals {
//     animals: (Animal | Cat)[];
//     master: Animal;
// }

// typescript-json-schema "src/tsToJsonSchemaTest.ts" * > src\editorSchema.json
// Need to manually add patternProperties:
/*
    "patternProperties": {
        "^(Config|config)$": { "$ref": "#/definitions/Config" }
    }
 */

// export interface MySeriesOptions extends hs.SeriesOptions {
//     sourceRef: string;
//     source: string;
//     // transforms?: TransformSettings[];
// }
export interface MySeriesOptions {
    sourceRef: string;
    source: string;
    // transforms?: TransformSettings[];
}

export interface ChartConfig {
    // source: DataSource | string;
    defaultSource: string;
    title?: string;
    series?: MySeriesOptions[]; // { id: string, name: string }
    // tslint:disable-next-line:no-any
    xAxis?: any;
    // tslint:disable-next-line:no-any
    yAxis?: any;

    // xAxis?: hs.AxisOptions;
    // yAxis?: hs.AxisOptions | hs.AxisOptions[];
}

export interface Config {
    sources: { name: string, url: string }[];
    charts: ChartConfig[];
}
