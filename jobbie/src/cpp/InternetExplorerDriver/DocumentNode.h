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

	const char* name();
	const char* getText();

private:
	IHTMLDocument2* doc;
};

#endif