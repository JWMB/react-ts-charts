import * as React from 'react';
import { Button } from 'reactstrap';

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
        return (
            <div>
                <textarea
                    style={{ width: '100%', height: '200px' }}
                    onChange={this.handleTextAreaChange}
                    value={this.state.text}
                />
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

    private handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        if (this.state.warnings) {
            this.validate();
        }
        this.setState({ text: value });
    }
    
}