#include "stdafx.h"
#include "AttributeNode.h"
#include "ElementNode.h"
#include "utils.h"
#include <iostream>

using namespace std;

ElementNode::ElementNode(IHTMLDOMNode* node) : AbstractNode(node)
{
}

ElementNode::~ElementNode()
{
}

Node* ElementNode::getFirstAttribute() const
{
	IDispatch* dispatch = NULL;
	node->get_attributes(&dispatch);

	CComQIPtr<IHTMLAttributeCollection> allAttributes(dispatch);
	dispatch->Release();

	long length = 0;
	allAttributes->get_length(&length);

	if (length == 0) {
		return NULL;
	}

	IUnknown* unknown;
	allAttributes->get__newEnum(&unknown);
	CComQIPtr<IEnumVARIANT> enumerator(unknown);
	unknown->Release();

	return new AttributeNode(enumerator);
}
