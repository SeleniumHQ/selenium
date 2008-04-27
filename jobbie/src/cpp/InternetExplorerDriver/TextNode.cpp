#include "stdafx.h"
#include "TextNode.h"
#include "utils.h"
#include <iostream>

using namespace std;

TextNode::TextNode(IHTMLDOMNode* node) : AbstractNode(node)
{
}

TextNode::~TextNode()
{
}

Node* TextNode::getFirstAttribute() const
{
	return NULL;
}

std::wstring TextNode::getText() const
{
	CComQIPtr<IHTMLDOMTextNode> element(node);

	CComBSTR text;
	element->toString(&text);
	return bstr2wstring(text);
}