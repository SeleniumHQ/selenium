#ifndef WEBDRIVER_IE_ELEMENTWRAPPER_H_
#define WEBDRIVER_IE_ELEMENTWRAPPER_H_

#include <string>
#include "json.h"

namespace webdriver {

// Forward declaration of classes to avoid
// circular include files.
class BrowserWrapper;

class ElementWrapper {
public:
	ElementWrapper(IHTMLElement *element, HWND containing_window_handle);
	virtual ~ElementWrapper(void);
	Json::Value ConvertToJson(void);
	int GetLocationOnceScrolledIntoView(long *x, long *y, long *width, long *height);
	int GetAttributeValue(const std::wstring& attribute_name, VARIANT *attribute_value);
	int IsDisplayed(bool *result);
	bool IsEnabled(void);
	bool IsSelected(void);
	bool IsCheckBox(void);
	bool IsRadioButton(void);
	int Click(void);
	int Hover(void);
	int DragBy(const int offset_x, const int offset_y, const int drag_speed);
	void FireEvent(IHTMLDOMNode* fire_event_on, LPCWSTR event_name);

	std::wstring element_id(void) const { return this->element_id_; }
	IHTMLElement *element(void) { return this->element_; }

private:
	int GetLocation(long *x, long *y, long *width, long *height);
	bool IsClickPointInViewPort(const long x, const long y, const long width, const long height);
	int GetFrameOffset(long *x, long *y);
	int GetContainingDocument(const bool use_dom_node, IHTMLDocument2** doc);
	int GetParentDocument(IHTMLWindow2* parent_window, IHTMLDocument2** parent_doc);

	std::wstring element_id_;
	CComPtr<IHTMLElement> element_;
	HWND containing_window_handle_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_ELEMENTWRAPPER_H_
