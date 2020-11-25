import React from 'react';
import { shallow, mount } from 'enzyme';
import Ring from '../../components/RingSystem/Ring/Ring';

test('Ring component', () => {
  let parentFunc = function() {
    console.log('Dummy parent func');
  }

  const ring = shallow(<Ring 
      radius={2}
      stroke={1}
      id={'2'}
      color={'#00000'}
      progress={10}
      offset={1}
      parentCB={parentFunc}
      label={'random label'}
    />)

  const props = ring.getElements()[0].props.children.props.children.props;
  const circle = props.children[0].props;

  expect(parseInt(props.id)).toEqual(2);
  expect(parseInt(props.height)).toEqual(4);
  expect(parseInt(props.width)).toEqual(4);
});
