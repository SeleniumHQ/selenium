#include "stdafx.h"
#include "AttributeNode.h"
#include "CommentNode.h"
#include "utils.h"
#include <iostream>

using namespace std;

CommentNode::CommentNode(IHTMLDOMNode* element) : AbstractNode(element)
{
}

CommentNode::~CommentNode() 
{
}

Node* CommentNode::getFirstChild() const 
{
	return NULL;
}

Node* CommentNode::getFirstAttribute() const 
{
	return NULL;
}
