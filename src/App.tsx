import * as React from 'react';
import './App.css';
import { ChartsAndSources } from './chartsAndSources';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
// Row, Col, Card, CardTitle, CardText, Button
import { DryRun } from './dryrun';
import { JsonEditor } from './jsonEditor';
// import * as chartConfig from './assets/climate.chartsource.json';
import * as chartConfig from './assets/swedenclimate.chartsource.json';
import { stringify2 } from './stringify2';

type State = {
  activeTab: string;
  configDef: string;
};

class App extends React.Component<object, State> {
  componentWillMount() {
    DryRun.tests();
    this.setState({ activeTab: '1', configDef: stringify2(chartConfig, { maxLength: 80, indent: 2 }) });
  }
  toggle(tab: string) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }
  render() {

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <Nav tabs={true}>
          <NavItem>
            <NavLink
              // className={classnames({ active: this.state.activeTab === '1' })}
              onClick={() => { this.toggle('1'); }}
            >
              Charts
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              // className={classnames({ active: this.state.activeTab === '2' })}
              onClick={() => { this.toggle('2'); }}
            >
              Definition
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId="1">
            <ChartsAndSources configDef={this.state.configDef} />
          </TabPane>
          <TabPane tabId="2">
            <JsonEditor
              onSubmit={this.handleSubmitChartsDef}
              data={this.state.configDef}
            />
          </TabPane>
        </TabContent>
      </div>
    );
  }
  private handleSubmitChartsDef = (data: string) => { // Object | Array<Object>
    // tslint:disable-next-line:no-console
    // console.log('data', data);
    this.setState({ configDef: data, activeTab: '1' });
  }
  // <Row>
  //   <Col sm="6">
  //     <Card>
  //     {/* body={true} Warning: Received `true` for a non-boolean attribute `body`.
  //     If you want to write it to the DOM, pass a string instead: body="true" or body={value.toString()}. */}
  //       <CardTitle>Special Title Treatment</CardTitle>
  //       <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
  //       <Button>Go somewhere</Button>
  //     </Card>
  //   </Col>
  //   <Col sm="6">
  //     <Card>
  //       <CardTitle>Special Title Treatment</CardTitle>
  //       <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
  //       <Button>Go somewhere</Button>
  //     </Card>
  //   </Col>
  // </Row>
}

export default App;
