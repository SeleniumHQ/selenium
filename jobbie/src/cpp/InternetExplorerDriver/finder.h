#ifndef finder_h
#define finder_h

#include <mshtml.h>

void findElementById(IHTMLDOMNode** result, const IHTMLDOMNode* node, const wchar_t* id);

#endif