import * as React from 'react';
import { Button } from 'reactstrap';
import MonacoEditor from 'react-monaco-editor';

type Props = {
    data: string;
    schema?: Object | undefined;
    onSubmit: (value: string) => void; // Object | Array<Object>
};
type State = {
    text: string;
    warnings: string;
};
export class JsonEditor extends React.Component<Props, State> {
    private reactEditor: MonacoEditor | null;
    componentWillMount() {
        const code = this.props.schema
            ? '{\n  "$schema": "mySchema",\n  "config": ' + this.props.data + '\n}'
            : this.props.data;
        this.setState({ text: code, warnings: '' }); // this.props.data
    }
    componentDidUpdate() {
        if (this.reactEditor && this.reactEditor.editor) {
            this.reactEditor.editor.layout();
        }
    }
    render() {
        const code = this.state.text;

         // TODO: can we create model here so we don't have to deal with the extra "$schema" in editor contents?
        // https://github.com/Microsoft/monaco-editor/issues/191
        // var model = monaco.editor.createModel(jsonCode, 'json', 'internal://server/foo.json');
        // monaco.editor.create(document.getElementById("container"), { model: model });

        const options: monaco.editor.IEditorConstructionOptions = {
            selectOnLineNumbers: true,
            parameterHints: true,
            model: undefined
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
                    ref={(editor) => this.reactEditor = editor}    
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
        if (this.props.schema) {
            editor.languages.json.jsonDefaults.setDiagnosticsOptions({
                validate: true,
                allowComments: true,
                schemas: [
                    {
                        uri: 'mySchema', // http://myserver/foo-schema.json
                        schema: this.props.schema
                    }
                ]
            });
        }    
    }
    private handleSubmit = () => {
        if (!this.validate()) {
            return;
        }
        if (this.props.onSubmit) {
            const parsed = JSON.parse(this.state.text);
            // this.props.onSubmit(parsed.config ? JSON.stringify(parsed.config) : parsed);
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