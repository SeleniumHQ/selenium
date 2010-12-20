#include "StdAfx.h"
#include "ElementWrapper.h"
#include "BrowserWrapper.h"
#include "atoms.h"
#include "interactions.h"

namespace webdriver {

ElementWrapper::ElementWrapper(IHTMLElement *element, BrowserWrapper *browser) {
	// NOTE: COM should be initialized on this thread, so we
	// could use CoCreateGuid() and StringFromGUID2() instead.
	UUID guid;
	RPC_WSTR guid_string = NULL;
	::UuidCreate(&guid);
	::UuidToString(&guid, &guid_string);

	// RPC_WSTR is currently typedef'd in RpcDce.h (pulled in by rpc.h)
	// as unsigned short*. It needs to be typedef'd as wchar_t* 
	wchar_t* cast_guid_string = reinterpret_cast<wchar_t*>(guid_string);
	this->element_id_ = cast_guid_string;

	::RpcStringFree(&guid_string);

	this->element_ = element;
	this->browser_ = browser;
}

ElementWrapper::~ElementWrapper(void) {
}

Json::Value ElementWrapper::ConvertToJson() {
	Json::Value json_wrapper;
	std::string id(CW2A(this->element_id_.c_str(), CP_UTF8));
	json_wrapper["ELEMENT"] = id;
	return json_wrapper;
}

int ElementWrapper::IsDisplayed(bool *result) {
	return this->IsElementDisplayed(this->element_, result);
}

bool ElementWrapper::IsEnabled() {
	CComQIPtr<IHTMLElement3> elem3(this->element_);
	if (!elem3) {
		return false;
	}
	VARIANT_BOOL is_disabled;
	elem3->get_disabled(&is_disabled);
	return !is_disabled;
}

int ElementWrapper::Click() {
	HWND containing_window_handle(this->browser_->GetWindowHandle());
	long x = 0, y = 0, w = 0, h = 0;
	int status_code = this->GetLocationOnceScrolledIntoView(&x, &y, &w, &h);

	if (status_code == SUCCESS) {
		long click_x = x + (w ? w / 2 : 0);
		long click_y = y + (h ? h / 2 : 0);

		// Create a mouse move, mouse down, mouse up OS event
		LRESULT result = mouseMoveTo(containing_window_handle, 10, x, y, click_x, click_y);
		if (result != SUCCESS) {
			return static_cast<int>(result);
		}
		
		result = clickAt(containing_window_handle, click_x, click_y, MOUSEBUTTON_LFET);
		if (result != SUCCESS) {
			return static_cast<int>(result);
		}

		//wait(50);
	}
	return status_code;
}

int ElementWrapper::Hover() {
	HWND containing_window_handle(this->browser_->GetWindowHandle());
	long x = 0, y = 0, w = 0, h = 0;
	int status_code = this->GetLocationOnceScrolledIntoView(&x, &y, &w, &h);

	if (status_code == SUCCESS) {
		long click_x = x + (w ? w / 2 : 0);
		long click_y = y + (h ? h / 2 : 0);

		// Create a mouse move, mouse down, mouse up OS event
		LRESULT lresult = mouseMoveTo(containing_window_handle, 100, 0, 0, click_x, click_y);
	}
	return status_code;
}

int ElementWrapper::DragBy(int offset_x, int offset_y, int drag_speed) {
	HWND containing_window_handle(this->browser_->GetWindowHandle());
	long x = 0, y = 0, w = 0, h = 0;
	int status_code = this->GetLocationOnceScrolledIntoView(&x, &y, &w, &h);

	if (status_code == SUCCESS) {
		long click_x = x + (w ? w / 2 : 0);
		long click_y = y + (h ? h / 2 : 0);

		// Create a mouse move, mouse down, mouse up OS event
		LRESULT lresult = mouseDownAt(containing_window_handle, click_x, click_y, MOUSEBUTTON_LFET);
		lresult = mouseMoveTo(containing_window_handle, (long)drag_speed, click_x, click_y, click_x + offset_x, click_y + offset_y);
		lresult = mouseUpAt(containing_window_handle, click_x + offset_x, click_y + offset_y, MOUSEBUTTON_LFET);
	}
	return status_code;
}

int ElementWrapper::GetAttributeValue(std::wstring attribute_name, VARIANT *attribute_value) {
	int status_code = SUCCESS;

	// The atom is just the definition of an anonymous
	// function: "function() {...}"; Wrap it in another function so we can
	// invoke it with our arguments without polluting the current namespace.
	std::wstring script(L"(function() { return (");

	// Read in all the scripts
	for (int j = 0; GET_ATTRIBUTE[j]; j++) {
		script += GET_ATTRIBUTE[j];
		script += L"\n";
	}

	// Now for the magic and to close things
	script += L")})();";

	ScriptWrapper *script_wrapper = new ScriptWrapper(script, 2);
	script_wrapper->AddArgument(this->element_);
	script_wrapper->AddArgument(attribute_name);
	status_code = this->browser_->ExecuteScript(script_wrapper);

	if (status_code == SUCCESS) {
		::VariantCopy(attribute_value, &script_wrapper->result());
	}

	delete script_wrapper;

	return SUCCESS;
}


int ElementWrapper::GetLocationOnceScrolledIntoView(long *x, long *y, long *width, long *height) {
    CComPtr<IHTMLDOMNode2> node;
	HRESULT hr = this->element_->QueryInterface(&node);

    if (FAILED(hr)) {
		//LOGHR(WARN, hr) << "Cannot cast html element to node";
		return ENOSUCHELEMENT;
    }

    bool displayed;
	int result = this->IsDisplayed(&displayed);
	if (result != SUCCESS) {
		return result;
	} 

	if (!displayed) {
        return EELEMENTNOTDISPLAYED;
    }

    if (!this->IsEnabled()) {
        return EELEMENTNOTENABLED;
    }

	this->browser_->AttachToWindowInputQueue();
	HWND containing_window_handle(this->browser_->GetWindowHandle());

	long top, left, bottom, right = 0;
	result = this->GetLocation(containing_window_handle, &left, &right, &top, &bottom);
	if (result != SUCCESS) {
		// Scroll the element into view
		//LOG(DEBUG) << "Will need to scroll element into view";
		HRESULT hr = this->element_->scrollIntoView(CComVariant(VARIANT_TRUE));
		if (FAILED(hr)) {
			// LOGHR(WARN, hr) << "Cannot scroll element into view";
			return EOBSOLETEELEMENT;
		}

		result = this->GetLocation(containing_window_handle, &left, &right, &top, &bottom);
	}

	if (result != SUCCESS) {
		return result;
	}

	long element_width = right - left;
	long element_height = bottom - top;

    long click_x = left;
	long click_y = top;

	//LOG(DEBUG) << "(x, y, w, h): " << clickX << ", " << clickY << ", " << elementWidth << ", " << elementHeight << endl;

    if (element_height == 0 || element_width == 0)  {
        //LOG(DEBUG) << "Element would not be visible because it lacks height and/or width.";
        return EELEMENTNOTDISPLAYED;
    }

	// This is a little funky.
	//if (ieRelease > 7)
	//{
	//	clickX += 2;
	//	clickY += 2;
	//}

	*x = click_x;
	*y = click_y;
	*width = element_width;
	*height = element_height;


    CComPtr<IDispatch> owner_doc_dispatch;
    hr = node->get_ownerDocument(&owner_doc_dispatch);
	if (FAILED(hr)) {
		//LOG(WARN) << "Unable to locate owning document";
		return ENOSUCHDOCUMENT;
	}
    CComQIPtr<IHTMLDocument3> owner_doc(owner_doc_dispatch);
	if (!owner_doc) {
		//LOG(WARN) << "Found document but it's not the expected type";
		return ENOSUCHDOCUMENT;
	}

    CComPtr<IHTMLElement> doc_element;
    hr = owner_doc->get_documentElement(&doc_element);
	if (FAILED(hr)) {
		//LOG(WARN) << "Unable to locate document element";
		return ENOSUCHDOCUMENT;
	}

    CComQIPtr<IHTMLElement2> e2(doc_element);
    if (!e2) {
        //LOG(WARN) << "Unable to get underlying html element from the document";
        return EUNHANDLEDERROR;
    }

    CComQIPtr<IHTMLDocument2> doc2(owner_doc);
	if (!doc2) {
		//LOG(WARN) << "Have the owning document, but unable to process";
		return ENOSUCHDOCUMENT;
	}

    long client_left, client_top;
    e2->get_clientLeft(&client_left);
    e2->get_clientTop(&client_top);

    click_x += client_left;
    click_y += client_top;

    // We now know the location of the element within its frame.
    // Where is the frame in relation to the HWND, though?
    // The ieWindow is the ultimate container, without chrome,
    // so if we know its location, we can subtract the screenLeft and screenTop
    // of the window.

    WINDOWINFO win_info;
    GetWindowInfo(containing_window_handle, &win_info);
    click_x -= win_info.rcWindow.left;
    click_y -= win_info.rcWindow.top;

    CComPtr<IHTMLWindow2> win2;
    hr = doc2->get_parentWindow(&win2);
	if (FAILED(hr)) {
		//LOG(WARN) << "Cannot obtain parent window";
		return ENOSUCHWINDOW;
	}
    CComQIPtr<IHTMLWindow3> win3(win2);
	if (!win3) {
		//LOG(WARN) << "Can't obtain parent window";
		return ENOSUCHWINDOW;
	}
    long screen_left, screen_top;
    hr = win3->get_screenLeft(&screen_left);
	if (FAILED(hr)) {
		//LOG(WARN) << "Unable to determine left corner of window";
		return ENOSUCHWINDOW;
	}
    hr = win3->get_screenTop(&screen_top);
	if (FAILED(hr)) {
		//LOG(WARN) << "Unable to determine top edge of window";
		return ENOSUCHWINDOW;
	}

    click_x += screen_left;
    click_y += screen_top;

    *x = click_x;
    *y = click_y;
	return SUCCESS;
}

int ElementWrapper::StyleIndicatesDisplayed(IHTMLElement *element, bool* displayed) {
	CComQIPtr<IHTMLElement2> e2(element);
	if (!e2) {
		return EOBSOLETEELEMENT;
	}

	CComPtr<IHTMLCurrentStyle> style;
	CComBSTR display;

	e2->get_currentStyle(&style);
	if(!style) {
		return EOBSOLETEELEMENT;
	}
	style->get_display(&display);
	std::wstring display_value = (BSTR)display;

	if (_wcsicmp(L"none", display_value.c_str()) == 0) {
		*displayed = false;
		return SUCCESS;
	}

	CComPtr<IHTMLElement> parent;
	element->get_parentElement(&parent);

	if (!parent) {
		*displayed = true;
		return SUCCESS;
	}

	// Check that parent has style
	CComQIPtr<IHTMLElement2> parent2(parent);

	CComPtr<IHTMLCurrentStyle> parent_style;
	parent2->get_currentStyle(&parent_style);

	if (parent_style) {
		return this->StyleIndicatesDisplayed(parent, displayed);
	}

	return SUCCESS;
}


bool ElementWrapper::StyleIndicatesVisible(IHTMLElement* element) {
	CComQIPtr<IHTMLElement2> e2(element);
	if (!e2) {
		return false;
	}
	CComPtr<IHTMLCurrentStyle> curr;
	CComBSTR visible;

	e2->get_currentStyle(&curr);
	if(!curr) {
		throw std::wstring(L"appears to manipulate obsolete DOM element.");
	}
	curr->get_visibility(&visible);

	std::wstring visible_value = (BSTR)visible;

	int is_visible = _wcsicmp(L"hidden", visible_value.c_str());
	if (is_visible == 0) {
		return false;
	}

	// If the style attribute was set on this class and contained visibility, then stop
	CComPtr<IHTMLStyle> style;
	element->get_style(&style);
	if (style) {
		CComBSTR visible_style;
		style->get_visibility(&visible_style);
		if (visible_style) {
			return true;  // because we'd have returned false earlier, otherwise
		}
	}

	CComPtr<IHTMLElement> parent;
	element->get_parentElement(&parent);
	if (parent) {
		return this->StyleIndicatesVisible(parent);
	}

	return true;
}

int ElementWrapper::GetLocation(HWND containing_window_handle, long* left, long* right, long* top, long* bottom) {
	*top, *left, *bottom, *right = 0;

	//wait(100);

	// getBoundingClientRect. Note, the docs talk about this possibly being off by 2,2
    // and Jon Resig mentions some problems too. For now, we'll hope for the best
    // http://ejohn.org/blog/getboundingclientrect-is-awesome/

    CComPtr<IHTMLElement2> element2;
	HRESULT hr = this->element_->QueryInterface(&element2);
	if (FAILED(hr)) {
		//LOGHR(WARN, hr) << "Unable to cast element to correct type";
		return EOBSOLETEELEMENT;
	}

    CComPtr<IHTMLRect> rect;
	hr = element2->getBoundingClientRect(&rect);
    if (FAILED(hr)) {
		//LOGHR(WARN, hr) << "Cannot figure out where the element is on screen";
		return EUNHANDLEDERROR;
    }

	long t, b, l, r = 0;

    rect->get_top(&t);
    rect->get_left(&l);
	rect->get_bottom(&b);
    rect->get_right(&r);

	// On versions of IE prior to 8 on Vista, if the element is out of the 
	// viewport this would seem to return 0,0,0,0. IE 8 returns position in 
	// the DOM regardless of whether it's in the browser viewport.

	// Handle the easy case first: does the element have size
	long w = r - l;
	long h = b - t;
	if (w < 0 || h < 0) { return EELEMENTNOTDISPLAYED; }

	// The element has a location, but is it in the viewport?
	// Turns out that the dimensions given (at least on IE 8 on vista)
	// are relative to the view port so get the dimensions of the window
	WINDOWINFO win_info;
	if (!::GetWindowInfo(containing_window_handle, &win_info)) {
		//LOG(WARN) << "Cannot determine size of window";
		return EELEMENTNOTDISPLAYED;
	}
    long win_width = win_info.rcClient.right - win_info.rcClient.left;
    long win_height = win_info.rcClient.bottom - win_info.rcClient.top;

	// Hurrah! Now we know what the visible area of the viewport is
	// Is the element visible in the X axis?
	if (l < 0 || l > win_width) {
		return EELEMENTNOTDISPLAYED;
	}

	// And in the Y?
	if (t < 0 || t > win_height) {
		return EELEMENTNOTDISPLAYED;
	}

	// TODO(simon): we should clip the size returned to the viewport
	*left = l;
	*right = r;
	*top = t;
	*bottom = b;

	return SUCCESS;
}

std::wstring ElementWrapper::GetText() {
	CComBSTR tag_name;
	this->element_->get_tagName(&tag_name);
	bool is_pre = tag_name == L"PRE";

	CComQIPtr<IHTMLDOMNode> node(this->element_);
	std::wstring element_text(L"");
	this->ExtractElementText(element_text, node, is_pre);

	/* Trim leading and trailing whitespace and line breaks. */
	std::wstring::const_iterator it_start = element_text.begin();
	while (it_start != element_text.end() && iswspace(*it_start)) {
		++it_start;
	}

	std::wstring::const_iterator it_end = element_text.end();
	while (it_start < it_end) {
		--it_end;
		if (!iswspace(*it_end)) {
			++it_end;
			break;
		}
	}

	// The decision has been made that line break strings
	// from Remote servers will normalize on the line-feed
	// as the line ending. Thus, we need to replace CR-LF
	// pairs with single LF characters.
	std::wstring to_return(it_start, it_end);
	size_t cr_lf_pos = to_return.find(L"\r\n");
	while (cr_lf_pos != std::wstring::npos) {
		to_return.replace(cr_lf_pos, 2, L"\n");
		cr_lf_pos = to_return.find(L"\r\n");
	}
	return to_return;
}

bool ElementWrapper::IsSelected() {
	CComQIPtr<IHTMLOptionElement> option(this->element_);
	if (option) {
		VARIANT_BOOL is_selected;
		option->get_selected(&is_selected);
		return is_selected == VARIANT_TRUE;
	}

	if (this->IsCheckBox() || this->IsRadioButton()) {
		CComQIPtr<IHTMLInputElement> input(this->element_);

		VARIANT_BOOL is_checked;
		input->get_checked(&is_checked);
		return is_checked == VARIANT_TRUE;
	}

	return false;
}

bool ElementWrapper::IsCheckBox() {
	CComQIPtr<IHTMLInputElement> input(this->element_);
	if (!input) {
		return false;
	}

	CComBSTR type_name;
	input->get_type(&type_name);
	return _wcsicmp((LPCWSTR)((BSTR)type_name), L"checkbox") == 0;
}

bool ElementWrapper::IsRadioButton() {
	CComQIPtr<IHTMLInputElement> input(this->element_);
	if (!input) {
		return false;
	}

	CComBSTR type_name;
	input->get_type(&type_name);
	return _wcsicmp((LPCWSTR)((BSTR)type_name), L"radio") == 0;
}

void ElementWrapper::ExtractElementText(std::wstring& to_return, IHTMLDOMNode* node, bool is_preformatted) {
	if (this->IsBlockLevel(node)) {
		this->CollapsingAppend(to_return, L"\r\n");
	}

	CComPtr<IDispatch> dispatch;
	node->get_childNodes(&dispatch);
	CComQIPtr<IHTMLDOMChildrenCollection> children(dispatch);

	if (!children)
		return;

	long length = 0;
	children->get_length(&length);
	bool displayed;
	

	for (long i = 0; i < length; i++) {
		CComPtr<IDispatch> dispatch2;
		children->item(i, &dispatch2);
		CComQIPtr<IHTMLDOMNode> child(dispatch2);

		CComBSTR child_name;
		child->get_nodeName(&child_name);

		CComQIPtr<IHTMLDOMTextNode> text_node(child);
		
		this->IsNodeDisplayed(node, &displayed);
		if (text_node && displayed) {
			CComBSTR text;
			text_node->get_data(&text);

			for (unsigned int i = 0; i < text.Length(); i++) {
				if (text[i] == 160) {
					text[i] = L' ';
				}
			}

			this->CollapsingAppend(to_return, is_preformatted ?
				std::wstring((BSTR)text) // bstr2wstring(text)
				: this->CollapseWhitespace(text));
		} else if (wcscmp((BSTR)child_name, L"PRE") == 0) {
			this->ExtractElementText(to_return, child, true);
		} else {
			this->ExtractElementText(to_return, child, false);
		}
	}

	if (this->IsBlockLevel(node)) {
		this->CollapsingAppend(to_return, L"\r\n");
	}
}

// Append s2 to s, collapsing intervening whitespace.
// Assumes that s and s2 have already been internally collapsed.
void ElementWrapper::CollapsingAppend(std::wstring& s, const std::wstring& s2) {
	if (s.empty() || s2.empty()) {
		s += s2;
		return;
	}

	// \r\n abutting \r\n collapses.
	if (s.length() >= 2 && s2.length() >= 2) {
		if (s[s.length() - 2] == L'\r' && s[s.length() - 1] == L'\n' &&
			s2[0] == L'\r' && s2[1] == L'\n') {
			s += s2.substr(2);
			return;
		}
	}

	// wspace abutting wspace collapses into a space character.
	if ((iswspace(s[s.length() - 1]) && s[s.length() - 1] != L'\n') &&
		(iswspace(s2[0]) && s[0] != L'\r')) {
		s += s2.substr(1);
		return;
	}

	s += s2;
}

std::wstring ElementWrapper::CollapseWhitespace(CComBSTR& comtext) {
	std::wstring to_return(L"");
	int previous_was_space = false;
	wchar_t previous = L'X';
	bool newline_already_appended = false;

	std::wstring text((BSTR)comtext);

	// Need to keep an eye out for '\r\n'
	for (unsigned int i = 0; i < text.size(); i++) {
		wchar_t c = text[i];
		int current_is_space = iswspace(c);

		// Append the character if the previous was not whitespace
		if (!(current_is_space && previous_was_space)) {
			to_return += c;
			newline_already_appended = false;
		} else if (previous == L'\r' && c == L'\n' && !newline_already_appended) {
			// If the previous char was '\r' and current is '\n'
			// and we've not already appended '\r\n' append '\r\n'.

			// The previous char was '\r' and has already been appended and
			// the current character is '\n'. Just appended that.
			to_return += c;
			newline_already_appended = true;
		}

		previous_was_space = current_is_space;
		previous = c;
	}

	return to_return;
}

bool ElementWrapper::IsBlockLevel(IHTMLDOMNode *node) {
	CComQIPtr<IHTMLElement> e(node);

	if (e) {
		CComBSTR tag_name;
		e->get_tagName(&tag_name);

		bool is_break = false;
		if (!wcscmp(L"BR", tag_name)) {
			is_break = true;
		}

		if (is_break) {
			return true;
		}
	}

	CComQIPtr<IHTMLElement2> element2(node);
	if (!element2) {
		return false;
	}

	CComPtr<IHTMLCurrentStyle> style;
	element2->get_currentStyle(&style);

	if (!style) {
		return false;
	}

	CComQIPtr<IHTMLCurrentStyle2> style2(style);

	if (!style2) {
		return false;
	}

	VARIANT_BOOL is_block;
	style2->get_isBlock(&is_block);

	return is_block == VARIANT_TRUE;
}

int ElementWrapper::IsNodeDisplayed(IHTMLDOMNode *node, bool* result) {
	if (!node) {
		*result = false;
		return SUCCESS;
	}

	// Walk up the parents of the node until we either find an element or null
	CComQIPtr<IHTMLElement> element(node);
	if (!element) {
		CComPtr<IHTMLDOMNode> parent;
		node->get_parentNode(&parent);
		return this->IsNodeDisplayed(parent, result);
	}
	return this->IsElementDisplayed(element, result);
}

int ElementWrapper::IsElementDisplayed(IHTMLElement *element, bool *result) {
	CComQIPtr<IHTMLInputHiddenElement> hidden(element);
	if (hidden) {
		*result = false;
		return SUCCESS;
	}

	bool displayed;
	int value = this->StyleIndicatesDisplayed(element, &displayed);

	if (value != SUCCESS) {
		return value;
	}

	*result = displayed && this->StyleIndicatesVisible(element);
	return SUCCESS;
}

void ElementWrapper::FireEvent(IHTMLDOMNode* fire_event_on, LPCWSTR event_name) {
	CComPtr<IDispatch> dispatch;
	this->element_->get_document(&dispatch);
	CComQIPtr<IHTMLDocument4> doc(dispatch);

	CComPtr<IHTMLEventObj> event_object;
	CComVariant empty;
	doc->createEventObject(&empty, &event_object);

	CComVariant eventref;
	V_VT(&eventref) = VT_DISPATCH;
	V_DISPATCH(&eventref) = event_object;

	CComBSTR on_change(event_name);
	VARIANT_BOOL cancellable;

	CComQIPtr<IHTMLElement3> element3(fire_event_on);
	element3->fireEvent(on_change, &eventref, &cancellable);
}

} // namespace webdriver