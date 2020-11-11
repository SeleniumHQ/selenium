import React from 'react';
import { shallow, mount } from 'enzyme';
import { Status } from '../components/Status';

test('CheckboxWithLabel changes the text after click', () => {
  const statusComp = mount(<Status status='UP'/>);
});