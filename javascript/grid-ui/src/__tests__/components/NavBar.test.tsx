import * as React from 'react';
import {render, screen} from '@testing-library/react';
import NavBar from '../../components/NavBar/NavBar';
import {createMemoryHistory} from 'history';
import {Router} from 'react-router-dom';

it('renders menu options names', () => {
  const history = createMemoryHistory();
  render(
    <Router history={history}>
      <NavBar/>
    </Router>
  );
  expect(screen.getByText("Sessions")).toBeInTheDocument();
  expect(screen.getByText("Overview")).toBeInTheDocument();
  expect(screen.getByText("Help")).toBeInTheDocument();
});

it('overall concurrency is not rendered on root path with a single node', () => {
  const history = createMemoryHistory();
  history.push("/");
  render(
    <Router history={history}>
      <NavBar open={true} maxSession={0} sessionCount={0} nodeCount={1}/>
    </Router>
  );
  expect(screen.queryByTestId('overall-concurrency')).not.toBeInTheDocument();
});

it('overall concurrency is rendered on root path with more than one node', () => {
  const history = createMemoryHistory();
  history.push("/");
  render(
    <Router history={history}>
      <NavBar open={true} maxSession={0} sessionCount={0} nodeCount={2}/>
    </Router>
  );
  expect(screen.getByTestId('overall-concurrency')).toBeInTheDocument();
});

it('overall concurrency is rendered on root path with more than one node', () => {
  const history = createMemoryHistory();
  history.push("/");
  render(
    <Router history={history}>
      <NavBar open={true} maxSession={0} sessionCount={0} nodeCount={2}/>
    </Router>
  );
  expect(screen.getByTestId('overall-concurrency')).toBeInTheDocument();
});

it('overall concurrency is rendered on a path different than and one node', () => {
  const history = createMemoryHistory();
  history.push("/sessions");
  render(
    <Router history={history}>
      <NavBar open={true} maxSession={0} sessionCount={0} nodeCount={1}/>
    </Router>
  );
  expect(screen.getByTestId('overall-concurrency')).toBeInTheDocument();
});
