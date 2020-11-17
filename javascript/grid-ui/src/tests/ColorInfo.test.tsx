import React from 'react';
import { shallow, mount } from 'enzyme';
import ColorInfo from '../components/RingSystem/ColorInfo/ColorInfo';

test('ColorInfo with no progress', () => {
  const colorInfo = shallow(
      <ColorInfo 
        color={"#00000"}
        text={"Random text"}
        id={"1"}
        progress={0}
      />
    )

  expect(colorInfo.getElements()[0].props.children.props).toEqual({});
});

test('ColorInfo with progress', () => {
  const colorInfo = shallow(
      <ColorInfo 
        color={"#00000"}
        text={"Random text"}
        id={"1"}
        progress={10}
      />
    )

  const items = colorInfo.getElements()[0].props.children.props.children;
  
  expect(items[0].props.content).toEqual('10%');
  expect(items[1].props.children).toEqual('Random text')
});
