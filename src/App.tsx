import * as React from 'react';
import './App.css';
import { ChartsAndSources } from './chartsAndSources';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
// import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
// Row, Col, Card, CardTitle, CardText, Button
// import { DryRun } from './dryrun';
import { JsonEditor } from './jsonEditor';
// import * as chartConfig from './assets/climate.chartsource.json';
// import * as chartConfig from './assets/swedenclimate.chartsource.json';
import * as chartConfig from './assets/cm.chartsource.json';
import * as chartSchema from './editorSchema.json';

import { stringify2 } from './stringify2';
import { ChartDefinitionStore } from './chartDefinitionStore';
import { default as axios } from 'axios';

// https://www.esrl.noaa.gov/psd/enso/mei/table.html
// http://www.remss.com/research/climate/

type State = {
  activeTab: string;
  configDef: string;
  currentConfigKey: string;
  currentConfigUnsaved: boolean;
  dropdownOpen?: boolean;
};

class App extends React.Component<object, State> {
  componentWillMount() {
    // DryRun.tests();

    // tslint:disable-next-line:no-any
    const params: any = {};
    if (window.location.search) {
      let query = window.location.search;
      const rxParams = /(\?|\&)([^=]+)\=([^&]+)/g;
      while (true) {
        const m = rxParams.exec(query);
        if (!m) {
          break;
        }
        params[m[2]] = m[3];
      }
    }
    if (!params.config) {
      if (process.env.REACT_APP_DEFAULT_EXTERNAL_CONFIG) {
        // tslint:disable-next-line:no-console
        console.log('ooo', process.env.REACT_APP_DEFAULT_EXTERNAL_CONFIG);
        params.config = process.env.REACT_APP_DEFAULT_EXTERNAL_CONFIG;
        params.cacheExpireDays = 0;
      }
    }

    if (params.config) {
      this.loadDefinitionFromUrl(params.config, params.cacheExpireDays);
      this.setState({ activeTab: '1', configDef: '{}' });
    } else {
      let currentConfigKey = 'default';
      let defaultConfig = '{}';
      if (ChartDefinitionStore.keys.length === 0) {
        defaultConfig = stringify2(chartConfig, { maxLength: 80, indent: 2 });
        ChartDefinitionStore.set(currentConfigKey, defaultConfig);
      } else {
        currentConfigKey = ChartDefinitionStore.keys[0];
        defaultConfig = ChartDefinitionStore.get(currentConfigKey) as string;
      }
      this.setState({
        activeTab: '1',
        configDef: defaultConfig,
        currentConfigKey: currentConfigKey,
        currentConfigUnsaved: false
      });
    }  
  }
  toggle(tab: string) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
        dropdownOpen: false
      });
    }
  }
  loadDefinitionFromUrl(url: string, cacheExpireDays: number = 0) {
    let gdriveRxStr = '(https://drive.google.com/open?id=)';
    gdriveRxStr = gdriveRxStr
      .replace(/\//g, '\\/')
      .replace(/\?/g, '\\?')
      .replace(/\./g, '\\.');
    const gdriveMatch = new RegExp(gdriveRxStr + '(.+)').exec(url);
    if (gdriveMatch && gdriveMatch.length > 1) {
      url = 'https://drive.google.com/uc?export=download&id=' + gdriveMatch[2];
    }
    const corsURL = process.env.REACT_APP_DEFAULT_DATA_API + '/corscheat/?url='
      + encodeURIComponent(url) + '&cacheExpireDays=' + (cacheExpireDays || 0);
    
    axios.get(corsURL).then(response => {
      const key = 'external';
      const value = stringify2(response.data, { maxLength: 80, indent: 2 });
      ChartDefinitionStore.set(key, value);
      this.setState({ configDef: value, currentConfigKey: key, currentConfigUnsaved: true });
    });
  }
  loadDefinition(key: string) {
    const def = key === 'New...' ? '{}' : ChartDefinitionStore.get(key);
    if (def) {
      this.setState({ configDef: def, currentConfigKey: key, currentConfigUnsaved: false });
    }
  }
  removeDefinition(key: string) {
    ChartDefinitionStore.remove(key);
    this.setState({ currentConfigUnsaved: false });
  }
  saveDefinition(key?: string) {
    key = key || this.state.currentConfigKey;
    ChartDefinitionStore.set(key, this.state.configDef);
    this.setState({ currentConfigUnsaved: false });
  }
  render() {
    const storedKeys = ChartDefinitionStore.keys;
    storedKeys.push('New...');
    const fEnter = (key: React.KeyboardEvent<HTMLInputElement>) => {
      if (key.key === 'Enter') {
        // tslint:disable-next-line:no-console
        // console.log('clicked', key.target, key.charCode, key.key, key.keyCode);
        const k = (key.target as HTMLInputElement).value;
        if (storedKeys.indexOf(k) < 0) {
          ChartDefinitionStore.set(k, this.state.configDef);
          this.setState({ currentConfigKey: k, currentConfigUnsaved: false });
        }
      }
    };
    const fRenderKey = (k: string) => {
      return this.state.currentConfigKey === k && k === 'New...'
        ? (<input type="text" onKeyDown={(key) => fEnter(key)} />)
        : (
          <span>
            <span
              onClick={() => { this.loadDefinition(k); }}
              style={({ fontWeight: this.state.currentConfigKey === k ? 'bold' : 'normal' })}
            >
              {k}
            </span>
            {(this.state.currentConfigKey === k && this.state.currentConfigUnsaved) ?
              (<span onClick={() => this.saveDefinition()}>&nbsp;Save</span>) : (<span />)}
            <span onClick={() => this.removeDefinition(k)}>&nbsp;DEL</span>
          </span>
        );
    };

    const storedDefinitions = storedKeys.map(k => (
      <div key={k} >
        {fRenderKey(k)}
        {/* <span
          onClick={() => { this.loadDefinition(k); }}
          style={({ fontWeight: this.state.currentConfigKey === k ? 'bold' : 'normal' })}
        >
          {k}
        </span>
        {(this.state.currentConfigKey === k && this.state.currentConfigUnsaved) ?
          (<span onClick={() => this.saveDefinition()}>&nbsp;Save</span>) : (<span/>)} */}
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
              schema={chartSchema}
            />
          </TabPane>
        </TabContent>
      </div>
    );
  }
  private handleSubmitChartsDef = (data: string) => { // Object | Array<Object>
    this.setState({ configDef: data, activeTab: '1', currentConfigUnsaved: data !== this.state.configDef });
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
