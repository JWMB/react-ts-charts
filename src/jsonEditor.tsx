import * as React from 'react';
import { Button } from 'reactstrap';
import MonacoEditor from 'react-monaco-editor';

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
        this.setState({ text: this.props.data, warnings: '' });
    }
    render() {
        const code = this.state.text;
        const options = {
          selectOnLineNumbers: true
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
        editor.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            allowComments: true,
            schemas: [
                {
                    uri: 'http://myserver/foo-schema.json',
                    schema: {
                        '$schema': 'http://json-schema.org/draft-06/schema#',
                        'title': 'Product',
                        'description': 'A product from Acme\'s catalog',
                        'type': 'object',
                        'properties': {
                            'id': {
                                'description': 'The unique identifier for a product',
                                'type': 'integer'
                            }
                        },
                        'required': ['id']
                    }
                }
                // {
                //     uri: 'http://myserver/foo-schema.json',
                //     schema: {
                //     type: 'object',
                //         properties: {
                //             p1: { enum: ['v1', 'v2'] },
                //             p2: { $ref: 'http://myserver/bar-schema.json' }
                //         }
                //     }
                // }, {
                //     uri: 'http://myserver/bar-schema.json',
                //     schema: {
                //     type: 'object',
                //     properties: { q1: { enum: [ 'x1', 'x2'] } }
                //     }
                // }
            ]
        });
    }
    private handleSubmit = () => {
        if (!this.validate()) {
            return;
        }
        if (this.props.onSubmit) {
            this.props.onSubmit(this.state.text);
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