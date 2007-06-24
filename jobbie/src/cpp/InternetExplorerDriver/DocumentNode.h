#ifndef DocumentNode_h
#define DocumentNode_h

#include <mshtml.h>
#include "Node.h"

class DocumentNode : public Node
{
public:
	DocumentNode(IHTMLDocument2* doc);
	~DocumentNode();

	Node* getDocument();
	Node* getNextSibling();
	Node* getFirstChild();
	Node* getFirstAttribute();

	const wchar_t* name();
	const wchar_t* getText();

private:
	IHTMLDocument2* doc;
};

#endif