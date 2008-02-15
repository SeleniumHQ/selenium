#include "stdafx.h"
#include "AttributeNode.h"
#include "ElementNode.h"
#include "DocumentNode.h"
#include "utils.h"
#include <string>
#include <iostream>

using namespace std;

AttributeNode::AttributeNode(IEnumVARIANT* allAttributes)
	: enumerator(allAttributes), attribute(NULL)
{
	moveToNextSpecifiedIndex();

	if (this->attribute == NULL) {
		throw "No declared attributes";
	}
}

AttributeNode::~AttributeNode()
{
}

Node* AttributeNode::getDocument() const
{
	return NULL;
}

Node* AttributeNode::getNextSibling() const
{
	try {
		return new AttributeNode(enumerator);
	} catch (const char*) {
		return NULL;
	}
}

Node* AttributeNode::getFirstChild() const
{
	return NULL;
}

Node* AttributeNode::getFirstAttribute() const
{
	return NULL;
}

std::wstring AttributeNode::name() const
{
	BSTR name;
	attribute->get_nodeName(&name);
	std::wstring toReturn = bstr2wstring(name);
	SysFreeString(name);

	if (_wcsicmp(L"classname", toReturn.c_str()) == 0) {
		toReturn = L"class";
	}

	return toReturn;
}

std::wstring AttributeNode::getText() const
{
	VARIANT value;
	attribute->get_nodeValue(&value);
	std::wstring toReturn = variant2wchar(value);
	VariantClear(&value);
	return toReturn;
}

void AttributeNode::moveToNextSpecifiedIndex()
{
	this->attribute = NULL;

	while (true) {
		VARIANT* results = new VARIANT[1];
		enumerator->Next(1, results, NULL);
		IDispatch* nextAttribute = results[0].pdispVal;
		if (nextAttribute == NULL)
			return;

		CComQIPtr<IHTMLDOMAttribute> attr(nextAttribute);

		VARIANT_BOOL specified;
		attr->get_specified(&specified);
		if (specified == VARIANT_TRUE) {
			this->attribute = attr;
			return;
		}
	}
}
