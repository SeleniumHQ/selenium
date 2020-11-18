import React from 'react';
import { shallow, mount } from 'enzyme';
import NavBar from '../components/NavBar/NavBar';

test('NavBar', () => {
  const navBar = shallow(<NavBar />)

  const linkProp = navBar.getElements()[0].props.children.props.children[0].props.children[0].props.children.props;

  expect(linkProp.id).toEqual('logo');
  expect(linkProp.to).toEqual('/home');
});
