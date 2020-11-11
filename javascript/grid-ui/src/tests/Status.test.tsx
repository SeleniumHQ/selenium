import React from 'react';
import { shallow, mount } from 'enzyme';
import { Status } from '../components/Status';

test('Status component', () => {
  const statusComp = shallow(<Status status='UP'/>);
});