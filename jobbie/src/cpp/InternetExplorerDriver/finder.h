#ifndef finder_h
#define finder_h

#include <mshtml.h>
#include <vector>
#include "ElementWrapper.h"

void findElementById(IHTMLDOMNode** result, InternetExplorerDriver* ie, const IHTMLDOMNode* node, const wchar_t* id);
void findElementsById(std::vector<ElementWrapper*>*toReturn, InternetExplorerDriver* ie, IHTMLDOMNode* node, const wchar_t* id);

void findElementByName(IHTMLDOMNode** result, InternetExplorerDriver* ie, const IHTMLDOMNode* node, const wchar_t* name);
void findElementsByName(std::vector<ElementWrapper*>*toReturn, InternetExplorerDriver* ie, IHTMLDOMNode* node, const wchar_t* name);

void findElementByClassName(IHTMLDOMNode** result, InternetExplorerDriver* ie, const IHTMLDOMNode* node, const wchar_t* name);
void findElementsByClassName(std::vector<ElementWrapper*>*toReturn, InternetExplorerDriver* ie, IHTMLDOMNode* node, const wchar_t* name);

void findElementByLinkText(IHTMLDOMNode** result, InternetExplorerDriver* ie, const IHTMLDOMNode* node, const wchar_t* text);
void findElementsByLinkText(std::vector<ElementWrapper*>*toReturn, InternetExplorerDriver* ie, IHTMLDOMNode* node, const wchar_t* text);

void findElementByXPath(IHTMLDOMNode** res, InternetExplorerDriver* ie, const IHTMLDOMNode* node, const wchar_t* xpath);
void findElementsByXPath(std::vector<ElementWrapper*>*toReturn, InternetExplorerDriver* ie, IHTMLDOMNode* node, const wchar_t* xpath);

#endif