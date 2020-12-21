import React from 'react';
import { shallow, mount } from 'enzyme';
import NodeRow  from '../../components/Node/NodeRow';
import NodeType from '../../models/node';

test('NodeRow', () => {
  let setFunc = function(state) {
    console.log(state);
  }

  const nodes = [
    {
      id: '2',
      capabilities: [],
      uri: 'https://foo.bar',
      status: 'UP',
      maxSession: 2,
    }
  ]

  nodes.map((node, i) => {
    const nodeRow = shallow(<NodeRow node={node} key={node.id} index={1} dispatch={setFunc} />)

    expect(nodeRow.getElements()[0].props.children[1].props.children[1]).toEqual(parseInt(nodes[0].id));
    expect(nodeRow.getElements()[0].props.children[2].props.children.props.to).toEqual('/node/' + parseInt(nodes[0].id));
    expect(nodeRow.getElements()[0].props.children[3].props.children.props.status).toEqual(nodes[0].status);
  });
});
