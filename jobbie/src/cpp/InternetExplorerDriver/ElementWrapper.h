/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

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

#ifndef JOBBIE_ELEMENTWRAPPER_H_
#define JOBBIE_ELEMENTWRAPPER_H_

#include <string>
#include <vector>

class DataMarshaller;
class InternetExplorerDriver;

class ElementWrapper
{
public:
	ElementWrapper(InternetExplorerDriver* ie, IHTMLElement *pElem);
	~ElementWrapper();

	bool isFresh();

    LPCWSTR getTagName();
	int sendKeys(LPCWSTR newValue);
	void clear();
	bool isSelected();
	int setSelected();
	bool isEnabled();
	bool isDisplayed();
	int toggle();
	LPCWSTR getText();
	LPCWSTR getValueOfCssProperty(LPCWSTR propertyName);
	void releaseInterface();

	int getLocationWhenScrolledIntoView(HWND* hwnd, long *x, long *y, long *width, long *height);
	void getLocation(long *x, long *y);
	int getWidth(long* width);
	int getHeight(long* height);

	int click();
	void submit();

	std::vector<ElementWrapper*>* getChildrenWithTagName(LPCWSTR tagName);

	IHTMLElement* getWrappedElement() {return pElement;}
	InternetExplorerDriver* getParent() {return ie;}


private:
	InternetExplorerDriver* ie;
	IHTMLElement *pElement;

	DataMarshaller& commandData();
	DataMarshaller& prepareCmData();
	DataMarshaller& prepareCmData(LPCWSTR str);
	bool sendThreadMsg(UINT msg, DataMarshaller& data);
};

#endif // JOBBIE_ELEMENTWRAPPER_H_
