#include "StdAfx.h"
#include "HtmlNode.h"

HtmlNode::HtmlNode(IHTMLDocument2 *doc)
{
	this->doc = doc;
}

HtmlNode::~HtmlNode()
{
}

void HtmlNode::useDocument()
{
}