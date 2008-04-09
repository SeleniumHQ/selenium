#include "stdafx.h"
#include "AttributeNode.h"
#include "ElementNode.h"
#include "DocumentNode.h"
#include "utils.h"
#include <string>
#include <iostream>

using namespace std;

AttributeNode::AttributeNode(IHTMLAttributeCollection* allAttributes, long currentIndex)
	: allAttributes(allAttributes), currentIndex(currentIndex), attribute(NULL)
{
	allAttributes->get_length(&length);

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
		return new AttributeNode(allAttributes, currentIndex);
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

	while (currentIndex < length) {
		currentIndex++;

		IDispatch* nextAttrDispatch;
		VARIANT idx;
		idx.vt = VT_I4;
		idx.lVal = currentIndex;
		allAttributes->item(&idx, &nextAttrDispatch);
		CComQIPtr<IHTMLDOMAttribute> attr(nextAttrDispatch);

		if (!attr) {
			continue;
		}

		VARIANT_BOOL specified;
		attr->get_specified(&specified);
		
		BSTR plainName;
		attr->get_nodeName(&plainName);
		std::wstring name = bstr2wstring(plainName);
		
		if (specified == VARIANT_TRUE || name == L"value") {
			SysFreeString(plainName);
			this->attribute = attr;
			return;
		}
		SysFreeString(plainName);
	}
}
