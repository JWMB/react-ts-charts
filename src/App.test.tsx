/**
 * @jest-environment node
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';

// https://github.com/facebook/create-react-app/tree/master/packages/react-scripts/template#srcsetuptestsjs-1
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
// tslint:disable-next-line:no-any
(global as any).localStorage = localStorageMock;

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});
