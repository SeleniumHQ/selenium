#pragma once

#include <Exdisp.h>
#include <mshtml.h>

class HtmlNode
{
public:
	HtmlNode(IHTMLDocument2 *doc);
	~HtmlNode();
	void useDocument();

private:
	IHTMLDocument2 *doc;
};
