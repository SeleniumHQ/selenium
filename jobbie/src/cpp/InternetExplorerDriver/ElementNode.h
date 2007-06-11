#ifndef ElementNode_h
#define ElementNode_h

#include <mshtml.h>
#include "IeWrapper.h"
#include "Node.h"
#include "DocumentNode.h"

class ElementNode : public Node
{
public:
	ElementNode(IeWrapper* ie, IHTMLElement* element);
	ElementNode(IeWrapper* ie, IHTMLDOMNode* element);
	~ElementNode();

	Node* getDocument();
	Node* getFirstChild();
	bool hasNextSibling();
	Node* getNextSibling();
	Node* getFirstAttribute();

	const char* name();
	const char* getText();

	void click();

private:
	IeWrapper* ie;
	IHTMLDOMNode* node;
};

#endif