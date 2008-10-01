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

	LPCWSTR getAttribute(LPCWSTR name);
	LPCWSTR getValue();
	void sendKeys(LPCWSTR newValue);
	void clear();
	bool isSelected();
	void setSelected();
	bool isEnabled();
	bool isDisplayed();
	bool toggle();
	LPCWSTR getText();
	LPCWSTR getValueOfCssProperty(LPCWSTR propertyName);
	void releaseInterface();

	long getX();
	long getY();
	long getWidth();
	long getHeight();

	void click();
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
