#ifndef DocumentNode_h
#define DocumentNode_h

#include <mshtml.h>
#include <string>
#include "Node.h"

class DocumentNode : public Node
{
public:
	DocumentNode(IHTMLDocument2* doc);
	~DocumentNode();

	virtual Node* getDocument() const;
	virtual Node* getNextSibling() const;
	virtual Node* getFirstChild() const;
	virtual Node* getFirstAttribute() const;

	std::wstring name() const;
	std::wstring getText() const;

private:
	IHTMLDocument2* doc;
};

#endif