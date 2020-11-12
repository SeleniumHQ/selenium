import React from 'react';
import { shallow, mount } from 'enzyme';
import { Status } from '../components/Status';

test('Status component for UP', () => {
  const statusComp = shallow(<Status status={'UP'} selected={0}/>);

  expect((statusComp.find('i').getElements()[0]).props.children[1]).toEqual('UP')
  expect((statusComp.find('div').getElements()[0]).props.children.props.children.props.css.styles.trim().indexOf('#3BEC70')).toBeGreaterThan(0)
});

test('Status component for UNAVAILABLE', () => {
  const statusComp = shallow(<Status status={'UNAVAILABLE'} selected={1}/>);

  expect((statusComp.find('i').getElements()[0]).props.children[1]).toEqual('UNAVAILABLE')
  expect((statusComp.find('div').getElements()[0]).props.children.props.children.props.css.styles.trim().indexOf('#8b8b8b')).toBeGreaterThan(0)
});

test('Status component for DRAINING', () => {
  const statusComp = shallow(<Status status={'DRAINING'} selected={2}/>);

  expect((statusComp.find('i').getElements()[0]).props.children[1]).toEqual('DRAINING')
  expect((statusComp.find('div').getElements()[0]).props.children.props.children.props.css.styles.trim().indexOf('#E40000')).toBeGreaterThan(0)
});

test('Status component for IDLE', () => {
  const statusComp = shallow(<Status status={'IDLE'} selected={3}/>);

  expect((statusComp.find('i').getElements()[0]).props.children[1]).toEqual('IDLE')
  expect((statusComp.find('div').getElements()[0]).props.children.props.children.props.css.styles.trim().indexOf('#E4D400')).toBeGreaterThan(0)
});
