import * as React from 'react';
import './App.css';
import { ChartsAndSources } from './chartsAndSources';
import { Nav, NavItem, NavLink, TabContent, TabPane, Row, Col, Card, CardTitle, CardText, Button } from 'reactstrap';

type State = {
  activeTab: string;
};

class App extends React.Component<object, State> {
  componentWillMount() {
    this.setState({ activeTab: '1' });
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
              Tab1
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              // className={classnames({ active: this.state.activeTab === '2' })}
              onClick={() => { this.toggle('2'); }}
            >
              Moar Tabs
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId="1">
            <ChartsAndSources />
          </TabPane>
          <TabPane tabId="2">
            <Row>
              <Col sm="6">
                <Card>
                {/* body={true} Warning: Received `true` for a non-boolean attribute `body`.
                If you want to write it to the DOM, pass a string instead: body="true" or body={value.toString()}. */}
                  <CardTitle>Special Title Treatment</CardTitle>
                  <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
                  <Button>Go somewhere</Button>
                </Card>
              </Col>
              <Col sm="6">
                <Card>
                  <CardTitle>Special Title Treatment</CardTitle>
                  <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
                  <Button>Go somewhere</Button>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </TabContent>
      </div>
    );
  }
}

export default App;
