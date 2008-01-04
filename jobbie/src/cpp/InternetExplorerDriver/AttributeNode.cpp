#include "stdafx.h"
#include "AttributeNode.h"
#include "ElementNode.h"
#include "DocumentNode.h"
#include "utils.h"
#include <string>
#include <iostream>

using namespace std;

AttributeNode::AttributeNode(IEnumVARIANT* enumerator)
{
	this->enumerator = enumerator;
	this->enumerator->AddRef();

	moveToNextSpecifiedIndex();

	if (this->attribute == NULL) {
		this->enumerator->Release();
		throw "No declared attributes";
	}
}

AttributeNode::~AttributeNode()
{
	attribute->Release();
	enumerator->Release();
}

Node* AttributeNode::getDocument() 
{
	return NULL;
}

Node* AttributeNode::getNextSibling()
{
	try {
		return new AttributeNode(enumerator);
	} catch (const char*) {
		return NULL;
	}
}

Node* AttributeNode::getFirstChild() 
{
	return NULL;
}

Node* AttributeNode::getFirstAttribute() 
{
	return NULL;
}

const std::wstring AttributeNode::name()
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

const wchar_t* AttributeNode::getText()
{
	VARIANT value;
	attribute->get_nodeValue(&value);
	const wchar_t* toReturn = variant2wchar(value);
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

		IHTMLDOMAttribute* attr;
		nextAttribute->QueryInterface(__uuidof(IHTMLDOMAttribute), (void**)&attr);

		VARIANT_BOOL specified;
		attr->get_specified(&specified);
		if (specified == VARIANT_TRUE) {
			this->attribute = attr;
			return;
		}
		attr->Release();
	}
}
