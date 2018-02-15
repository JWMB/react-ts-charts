import * as React from 'react';
import { Button } from 'reactstrap';
import MonacoEditor from 'react-monaco-editor';
import * as schema from './editorSchema.json';

type Props = {
    data: string;
    onSubmit: (value: string) => void;
};
type State = {
    text: string;
    warnings: string;
};
export class JsonEditor extends React.Component<Props, State> {
    componentWillMount() {
        const code = '{\n  "$schema": "mySchema",\n  "config": ' + this.props.data + '\n}';
        this.setState({ text: code, warnings: '' }); // this.props.data
    }
    render() {
        const code = this.state.text;
        const options: monaco.editor.IEditorOptions = {
            selectOnLineNumbers: true,
            parameterHints: true  
        };
        const requireConfig = {
          url: 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.1/require.min.js',
          paths: {
            'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.10.1/min/vs/'
          }
        };
        return (
            <div>
                <MonacoEditor
                    width="800"
                    height="600"
                    language="json"
                    theme="vs-dark"
                    value={code}
                    options={options}
                    requireConfig={requireConfig}
                    onChange={this.handleMonacoChange}
                    // editorDidMount={::this.editorDidMount}
                    editorWillMount={this.handleMonacoWillMount}
                />
                {/* <textarea
                    style={{ width: '100%', height: '200px' }}
                    onChange={this.handleTextAreaChange}
                    value={this.state.text}
                /> */}
                <div>{this.state.warnings}</div>
                <Button onClick={this.handleSubmit}>
                    Update
                </Button>
                {/* <input
                    type="button"
                    value="Update"
                    onClick={this.handleSubmit}
                    disabled={!!this.state.warnings.length}
                /> */}
            </div>
        );
    }
    // tslint:disable-next-line:no-any
    private handleMonacoWillMount = (editor: typeof monaco) => {
        // editor.languages.json.jsonDefaults.onDidChange
        // https://github.com/Microsoft/monaco-editor/issues/191
        // var model = monaco.editor.createModel(jsonCode, 'json', 'internal://server/foo.json');
        // monaco.editor.create(document.getElementById("container"), { model: model });
        // tslint:disable-next-line:no-console
        // console.log('schema?', schema);
        // const tmpSchema = {
        //     // 'title': 'Test schema',
        //     '$schema': 'http://json-schema.org/draft-04/schema#',
        //     // 'type': 'object',
        //     'definitions': {
        //         'anObject': {
        //             'type': 'object',
        //             'description': 'Settings',
        //             'properties': {
        //                 'aBoolean': {
        //                     'description': '',
        //                     'type': 'boolean'
        //                 },
        //                 'aNumber': {
        //                     'description': '',
        //                     'type': 'number',
        //                     'default': 1
        //                 }
        //             }
        //         },
        //         'another': {
        //             'type': 'object',
        //             'description': 'Some other description',
      
        //             'properties': {
        //                 'url': {
        //                     'description': '',
        //                     'type': 'string',
        //                     'pattern': '^((//|https?://).+|)$'
        //                 },
        //                 'prefetch': {
        //                     'type': 'boolean',
        //                     'default': true
        //                 }
        //             }
        //         }
        //     },
        //     'patternProperties': {
        //         '^anObject$': { '$ref': '#/definitions/anObject' },
        //         '^anobject$': { '$ref': '#/definitions/anObject' },
        //         '^(another|Another)$': { '$ref': '#/definitions/another' }
        //     }
        // };
        editor.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            allowComments: true,
            schemas: [
                {
                    uri: 'mySchema', // http://myserver/foo-schema.json
                    schema: schema
                }
            ]
        });
    }
    private handleSubmit = () => {
        if (!this.validate()) {
            return;
        }
        if (this.props.onSubmit) {
            const parsed = JSON.parse(this.state.text);
            if (parsed.config) {
                this.props.onSubmit(JSON.stringify(parsed.config));
            } else {
                this.props.onSubmit(this.state.text);
            }
        }
    }
    private validate(): boolean {
        try {
            JSON.parse(this.state.text);
            this.setState({ warnings: '' });
            return true;
        } catch (err) {
            this.setState({ warnings: '' + err });
            return false;
        }
    }

    private handleMonacoChange = (newValue: string, e: monaco.editor.IModelContentChangedEvent) => {
        if (this.state.warnings) {
            this.validate();
        }
        // const markers = monaco.editor.getModelMarkers({});
        // if (markers.length) {
        //     markers.filter(m => m.severity > 2).map(m => m.message);
        // }
        this.setState({ text: newValue });
    }
    // private handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    //     const value = event.target.value;
    //     if (this.state.warnings) {
    //         this.validate();
    //     }
    //     this.setState({ text: value });
    // }
    
}