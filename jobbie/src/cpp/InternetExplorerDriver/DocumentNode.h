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
	bool hasNextChild();
	Node* getNextChild();

	const char* name();

private:
	IHTMLDocument2* doc;
	int childIndex;
};

#endif