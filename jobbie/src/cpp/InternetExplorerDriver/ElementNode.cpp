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

Node* ElementNode::getFirstAttribute() 
{
	IDispatch* dispatch = NULL;
	node->get_attributes(&dispatch);

	IHTMLAttributeCollection* allAttributes;
	dispatch->QueryInterface(__uuidof(IHTMLAttributeCollection), (void**)&allAttributes);
	dispatch->Release();

	long length = 0;
	allAttributes->get_length(&length);

	if (length == 0) {
		allAttributes->Release();
		return NULL;
	}

	IUnknown* unknown;
	allAttributes->get__newEnum(&unknown);

	CComQIPtr<IEnumVARIANT, &__uuidof(IEnumVARIANT)> enumerator;
	enumerator = unknown;

	AttributeNode* toReturn = new AttributeNode(enumerator);
	allAttributes->Release();
	return toReturn;
}
