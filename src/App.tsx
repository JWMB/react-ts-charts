import * as React from 'react';
import './App.css';
import { ChartsAndSources } from './chartsAndSources';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
// import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
// Row, Col, Card, CardTitle, CardText, Button
import { DryRun } from './dryrun';
import { JsonEditor } from './jsonEditor';
// import * as chartConfig from './assets/climate.chartsource.json';
// import * as chartConfig from './assets/swedenclimate.chartsource.json';
import * as chartConfig from './assets/cm.chartsource.json';
import { stringify2 } from './stringify2';
import { ChartDefinitionStore } from './chartDefinitionStore';

// https://www.esrl.noaa.gov/psd/enso/mei/table.html
// http://www.remss.com/research/climate/

type State = {
  activeTab: string;
  configDef: string;
  dropdownOpen?: boolean;
};

class App extends React.Component<object, State> {
  componentWillMount() {
    DryRun.tests();

    let defaultConfig = '{}';
    if (ChartDefinitionStore.keys.length === 0) {
      defaultConfig = stringify2(chartConfig, { maxLength: 80, indent: 2 });
      ChartDefinitionStore.set('default', defaultConfig);
    } else {
      defaultConfig = ChartDefinitionStore.get('default') as string;
    }
    this.setState({ activeTab: '1', configDef: defaultConfig });
  }
  toggle(tab: string) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
        dropdownOpen: false
      });
    }
  }
  loadDefinition(key: string) {
    if (key === 'New...') {
      this.setState({ configDef: '{}' });
    } else {
      const def = ChartDefinitionStore.get(key);
      if (def) {
        this.setState({ configDef: def });
      }
    }
  }
  render() {
    const storedKeys = ChartDefinitionStore.keys;
    storedKeys.push('New...');
    // const fClick = (key: string) => {
    //   console.log('clicked ' + key);
    //  };
    const storedDefinitions = storedKeys.map(k => (
      <div key={k} >
        <span onClick={() => { this.loadDefinition(k); }}>{k}</span>
        {/* {Math.random() < 0.5 ? (<span>Save</span>) : (<span/>)} */}
      </div>
    ));
    
    return (
      <div className="App">
        <header className="App-header">
          {/* <h1 className="App-title">Welcome to React</h1> */}
        </header>
        <div>
          {storedDefinitions}
        </div>
        {/* <Dropdown
          isOpen={this.state.dropdownOpen}
          toggle={() => { this.setState({ dropdownOpen: !this.state.dropdownOpen }); }}
        >
          <DropdownToggle caret={true}>
            Dropdown
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem header={true}>Header</DropdownItem>
            <DropdownItem disabled={true}>Action</DropdownItem>
            <DropdownItem>Another Action</DropdownItem>
            <DropdownItem divider={true} />
            <DropdownItem>Another Action</DropdownItem>
          </DropdownMenu>
        </Dropdown> */}
        {/* <div className="btn-group">
          <button
            type="button"
            className="btn btn-danger dropdown-toggle"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            Action
          </button>
          <div className="dropdown-menu">
            <a className="dropdown-item" href="#">Action</a>
            <a className="dropdown-item" href="#">Another action</a>
            <a className="dropdown-item" href="#">Something else here</a>
            <div className="dropdown-divider"/>
            <a className="dropdown-item" href="#">Separated link</a>
          </div>
        </div> */}
        <Nav tabs={true}>
          <NavItem>
            <NavLink
              className={this.state.activeTab === '1' ? 'active' : ''}
              onClick={() => { this.toggle('1'); }}
            >
              Charts
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={this.state.activeTab === '2' ? 'active' : ''}
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
  // </Row>
}

export default App;
