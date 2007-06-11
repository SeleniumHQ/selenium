#ifndef DocumentNode_h
#define DocumentNode_h

#include <mshtml.h>
#include "IeWrapper.h"
#include "Node.h"

class DocumentNode : public Node
{
public:
	DocumentNode(IeWrapper* ie, IHTMLDocument2* doc);
	~DocumentNode();

	Node* getDocument();
	bool hasNextSibling();
	Node* getNextSibling();
	Node* getFirstChild();
	Node* getFirstAttribute();

	const char* name();
	const char* getText();

private:
	IeWrapper* ie;
	IHTMLDocument2* doc;
};

#endif