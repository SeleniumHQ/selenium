import * as React from 'react';
import { shallow, mount } from 'enzyme';
import { CheckboxWithLabel } from '../components/CheckBox';

test('CheckboxWithLabel changes the text after click', () => {
  const checkbox = shallow(<CheckboxWithLabel labelOn="On" labelOff="Off" />);

  // Interaction demo
  expect(checkbox.text()).toEqual('Off');
  checkbox.find('input').simulate('change');
  expect(checkbox.text()).toEqual('On');

  // Snapshot demo
  expect(checkbox).toMatchSnapshot();
});
