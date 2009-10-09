/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

#ifndef finder_h
#define finder_h

#include <mshtml.h>
#include <vector>
#include "ElementWrapper.h"

void findElementById(IHTMLDOMNode** result, InternetExplorerDriver* ie, const IHTMLDOMNode* node, const wchar_t* id);
void findElementsById(std::vector<ElementWrapper*>*toReturn, InternetExplorerDriver* ie, IHTMLDOMNode* node, const wchar_t* id);

void findElementByName(IHTMLDOMNode** result, InternetExplorerDriver* ie, const IHTMLDOMNode* node, const wchar_t* name);
void findElementsByName(std::vector<ElementWrapper*>*toReturn, InternetExplorerDriver* ie, IHTMLDOMNode* node, const wchar_t* name);

void findElementByTagName(IHTMLDOMNode** result, InternetExplorerDriver* ie, const IHTMLDOMNode* node, const wchar_t* name);
void findElementsByTagName(std::vector<ElementWrapper*>*toReturn, InternetExplorerDriver* ie, IHTMLDOMNode* node, const wchar_t* name);

void findElementByClassName(IHTMLDOMNode** result, InternetExplorerDriver* ie, const IHTMLDOMNode* node, const wchar_t* name);
void findElementsByClassName(std::vector<ElementWrapper*>*toReturn, InternetExplorerDriver* ie, IHTMLDOMNode* node, const wchar_t* name);

void findElementByLinkText(IHTMLDOMNode** result, InternetExplorerDriver* ie, const IHTMLDOMNode* node, const wchar_t* text);
void findElementsByLinkText(std::vector<ElementWrapper*>*toReturn, InternetExplorerDriver* ie, IHTMLDOMNode* node, const wchar_t* text);

#endif
