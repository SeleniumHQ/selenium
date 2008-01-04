#include "stdafx.h"
#include "TextNode.h"
#include <iostream>

using namespace std;

TextNode::TextNode(IHTMLDOMNode* node) : AbstractNode(node)
{
}

TextNode::~TextNode()
{
}

Node* TextNode::getFirstAttribute() 
{
	return NULL;
}
