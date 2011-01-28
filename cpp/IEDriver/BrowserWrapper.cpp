#include "StdAfx.h"
#include "BrowserWrapper.h"
#include "cookies.h"
#include <comutil.h>

namespace webdriver {

BrowserWrapper::BrowserWrapper(IWebBrowser2 *browser, HWND hwnd, BrowserFactory *factory) {
	// NOTE: COM should be initialized on this thread, so we
	// could use CoCreateGuid() and StringFromGUID2() instead.
	UUID guid;
	RPC_WSTR guid_string = NULL;
	::UuidCreate(&guid);
	::UuidToString(&guid, &guid_string);

	// RPC_WSTR is currently typedef'd in RpcDce.h (pulled in by rpc.h)
	// as unsigned short*. It needs to be typedef'd as wchar_t* 
	wchar_t* cast_guid_string = reinterpret_cast<wchar_t*>(guid_string);
	this->browser_id_ = cast_guid_string;

	::RpcStringFree(&guid_string);

	this->wait_required_ = false;
	this->is_navigation_started_ = false;
	this->factory_ = factory;
	this->window_handle_ = hwnd;
	this->browser_ = browser;
	this->focused_frame_window_ = NULL;
	this->AttachEvents();
}

BrowserWrapper::~BrowserWrapper(void) {
}

void BrowserWrapper::GetDocument(IHTMLDocument2 **doc) {
	IHTMLWindow2 *window;

	if (this->focused_frame_window_ == NULL) {
		CComPtr<IDispatch> dispatch;
		HRESULT hr = this->browser_->get_Document(&dispatch);
		if (FAILED(hr)) {
			//LOGHR(DEBUG, hr) << "Unable to get document";
			return;
		}

		CComPtr<IHTMLDocument2> doc;
		hr = dispatch->QueryInterface(&doc);
		if (FAILED(hr)) {
			//LOGHR(WARN, hr) << "Have document but cannot cast";
			return;
		}

		doc->get_parentWindow(&window);
	} else {
		window = this->focused_frame_window_;
	}

	if (window) {
		HRESULT hr = window->get_document(doc);
		if (FAILED(hr)) {
			//LOGHR(WARN, hr) << "Cannot get document";
		}
	}
}

std::wstring BrowserWrapper::GetTitle() {
	CComPtr<IDispatch> dispatch;
	HRESULT hr = this->browser_->get_Document(&dispatch);
	if (FAILED(hr)) {
		//LOGHR(DEBUG, hr) << "Unable to get document";
		return L"";
	}

	CComPtr<IHTMLDocument2> doc;
	hr = dispatch->QueryInterface(&doc);
	if (FAILED(hr)) {
		//LOGHR(WARN, hr) << "Have document but cannot cast";
		return L"";
	}

	CComBSTR title;
	hr = doc->get_title(&title);
	if (FAILED(hr)) {
		//LOGHR(WARN, hr) << "Unable to get document title";
		return L"";
	}

	std::wstring title_string = (BSTR)title;
	return title_string;
}

std::wstring BrowserWrapper::ConvertVariantToWString(VARIANT *to_convert) {
	VARTYPE type = to_convert->vt;

	switch(type) {
		case VT_BOOL:
			return to_convert->boolVal == VARIANT_TRUE ? L"true" : L"false";

		case VT_BSTR:
			if (!to_convert->bstrVal) {
				return L"";
			}
			
			return (BSTR)to_convert->bstrVal;
	
		case VT_I4:
			{
				wchar_t *buffer = (wchar_t *)malloc(sizeof(wchar_t) * MAX_DIGITS_OF_NUMBER);
				_i64tow_s(to_convert->lVal, buffer, MAX_DIGITS_OF_NUMBER, BASE_TEN_BASE);
				return buffer;
			}

		case VT_EMPTY:
			return L"";

		case VT_NULL:
			// TODO(shs96c): This should really return NULL.
			return L"";

		// This is lame
		case VT_DISPATCH:
			return L"";
	}
	return L"";
}

std::wstring BrowserWrapper::GetCookies() {
	CComPtr<IHTMLDocument2> doc;
	this->GetDocument(&doc);

	if (!doc) {
		return L"";
	}

	CComBSTR cookie;
	HRESULT hr = doc->get_cookie(&cookie);
	if (!cookie) {
		cookie = L"";
	}

	std::wstring cookie_string((BSTR)cookie);
	return cookie_string;
}

int BrowserWrapper::AddCookie(std::wstring cookie) {
	CComBSTR cookie_bstr(cookie.c_str());

	CComPtr<IHTMLDocument2> doc;
	this->GetDocument(&doc);

	if (!doc) {
		return EUNHANDLEDERROR;
	}

	if (!this->IsHtmlPage(doc)) {
		return ENOSUCHDOCUMENT;
	}

	if (!SUCCEEDED(doc->put_cookie(cookie_bstr))) {
		return EUNHANDLEDERROR;
	}

	return SUCCESS;
}

int BrowserWrapper::DeleteCookie(std::wstring cookie_name) {
	// Construct the delete cookie script
	std::wstring script;
	for (int i = 0; DELETECOOKIES[i]; i++) {
		script += DELETECOOKIES[i];
	}

	ScriptWrapper *script_wrapper = new ScriptWrapper(this, script, 1);
	script_wrapper->AddArgument(cookie_name);
	int status_code = script_wrapper->Execute();
	delete script_wrapper;

	return status_code;
}

bool BrowserWrapper::IsHtmlPage(IHTMLDocument2* doc) {
	CComBSTR type;
	if (!SUCCEEDED(doc->get_mimeType(&type))) {
		return false;
	}

	// To be technically correct, we should look up the extension specified
	// for the text/html MIME type first (located in the "Extension" value of
	// HKEY_CLASSES_ROOT\MIME\Database\Content Type\text/html), but that should
	// always resolve to ".htm" anyway. From the extension, we can find the 
	// browser-specific subkey of HKEY_CLASSES_ROOT, the default value of which
	// should contain the browser-specific friendly name of the MIME type for
	// HTML documents, which is what IHTMLDocument2::get_mimeType() returns.
	std::wstring document_type_key_name;
	if (!this->factory_->GetRegistryValue(HKEY_CLASSES_ROOT, L".htm", L"", &document_type_key_name)) {
		return false;
	}

	std::wstring mime_type_name;
	if (!this->factory_->GetRegistryValue(HKEY_CLASSES_ROOT, document_type_key_name, L"", &mime_type_name)) {
		return false;
	}

	std::wstring type_string((BSTR)type);
	return type_string == mime_type_name;
}

int BrowserWrapper::SetFocusedFrameByElement(IHTMLElement *frame_element) {
	HRESULT hr = S_OK;
	if (!frame_element) {
		this->focused_frame_window_.Detach();
		this->focused_frame_window_ = NULL;
		return SUCCESS;
	}

	CComQIPtr<IHTMLFrameBase2> frame_base(frame_element);
	if (!frame_base) {
		// IHTMLElement is not a FRAME or IFRAME element.
		return ENOSUCHFRAME;
	}

	CComQIPtr<IHTMLWindow2> interim_result;
	hr = frame_base->get_contentWindow(&interim_result);
	if (FAILED(hr)) {
		// Cannot get contentWindow from IHTMLFrameBase2.
		return ENOSUCHFRAME;
	}

	this->focused_frame_window_ = interim_result.Detach();
	return SUCCESS;
}

int BrowserWrapper::SetFocusedFrameByName(std::wstring frame_name) {
	CComPtr<IHTMLDocument2> doc;
	this->GetDocument(&doc);

	CComQIPtr<IHTMLFramesCollection2> frames;
	HRESULT hr = doc->get_frames(&frames);

	if (frames == NULL) { 
		// No frames in document. Exit.
		return ENOSUCHFRAME;
	}

	long length = 0;
	frames->get_length(&length);
	if (!length) { 
		// No frames in document. Exit.
		return ENOSUCHFRAME;
	}

	CComVariant name;
	CComBSTR name_bstr(frame_name.c_str());
	name_bstr.CopyTo(&name);

	// Find the frame
	CComVariant frame_holder;
	hr = frames->item(&name, &frame_holder);

	if (FAILED(hr)) {
		// Error retrieving frame. Exit.
		return ENOSUCHFRAME;
	}

	CComQIPtr<IHTMLWindow2> interim_result = frame_holder.pdispVal;
	if (!interim_result) {
		// Error retrieving frame. Exit.
		return ENOSUCHFRAME;
	}

	this->focused_frame_window_ = interim_result.Detach();
	return SUCCESS;
}

int BrowserWrapper::SetFocusedFrameByIndex(int frame_index) {
	CComPtr<IHTMLDocument2> doc;
	this->GetDocument(&doc);

	CComQIPtr<IHTMLFramesCollection2> frames;
	HRESULT hr = doc->get_frames(&frames);

	if (frames == NULL) { 
		// No frames in document. Exit.
		return ENOSUCHFRAME;
	}

	long length = 0;
	frames->get_length(&length);
	if (!length) { 
		// No frames in document. Exit.
		return ENOSUCHFRAME;
	}

	CComVariant index;
	index.vt = VT_I4;
	index.lVal = frame_index;

	// Find the frame
	CComVariant frame_holder;
	hr = frames->item(&index, &frame_holder);

	if (FAILED(hr)) {
		// Error retrieving frame. Exit.
		return ENOSUCHFRAME;
	}

	CComQIPtr<IHTMLWindow2> interim_result = frame_holder.pdispVal;
	if (!interim_result) {
		// Error retrieving frame. Exit.
		return ENOSUCHFRAME;
	}

	this->focused_frame_window_ = interim_result.Detach();
	return SUCCESS;
}

HWND BrowserWrapper::GetWindowHandle() {
	// If, for some reason, the window handle is no longer valid,
	// set the member variable to NULL so that we can reacquire
	// the valid window handle. Note that this can happen when
	// browsing from one type of content to another, like from
	// HTML to a transformed XML page that renders content.
	if (!::IsWindow(this->window_handle_)) {
		this->window_handle_ = NULL;
	}

	if (this->window_handle_ == NULL) {
		this->window_handle_ = this->factory_->GetTabWindowHandle(this->browser_);
	}

	return this->window_handle_;
}

void __stdcall BrowserWrapper::BeforeNavigate2(IDispatch * pObject, VARIANT * pvarUrl, VARIANT * pvarFlags, VARIANT * pvarTargetFrame,
VARIANT * pvarData, VARIANT * pvarHeaders, VARIANT_BOOL * pbCancel) {
	// std::cout << "BeforeNavigate2\r\n";
}

void __stdcall BrowserWrapper::OnQuit() {
	this->Quitting.raise(this->browser_id_);
}

void __stdcall BrowserWrapper::NewWindow3(IDispatch **ppDisp, VARIANT_BOOL * pbCancel, DWORD dwFlags, BSTR bstrUrlContext, BSTR bstrUrl) {
	// Handle the NewWindow3 event to allow us to immediately hook
	// the events of the new browser window opened by the user action.
	// This will not allow us to handle windows created by the JavaScript
	// showModalDialog function().
	IWebBrowser2 *browser = this->factory_->CreateBrowser();
	BrowserWrapper *new_window_wrapper = new BrowserWrapper(browser, NULL, this->factory_);
	*ppDisp = browser;
	this->NewWindow.raise(new_window_wrapper);
}

void __stdcall BrowserWrapper::DocumentComplete(IDispatch *pDisp, VARIANT *URL) {
	// Flag the browser as navigation having started.
	// std::cout << "DocumentComplete\r\n";
	this->is_navigation_started_ = true;

	// DocumentComplete fires last for the top-level frame. If it fires
	// for the top-level frame and the focused_frame_window_ member variable
	// is not NULL, we assume we have navigated from within a frameset to a
	// link that has a target of "_top", which replaces the frameset with the
	// target page. On a top-level navigation, we are supposed to reset the
	// focused frame to the top-level, so we do that here.
	// NOTE: This is a possible source of unreliability if the above 
	// assumptions turn out to be wrong and/or the event firing doesn't work
	// the way we expect it to.
	CComPtr<IDispatch> dispatch(this->browser_);
	if (dispatch.IsEqualObject(pDisp) && this->focused_frame_window_ != NULL) {
		this->focused_frame_window_.Detach();
		this->focused_frame_window_ = NULL;
	}
}

void BrowserWrapper::AttachEvents() {
	CComQIPtr<IDispatch> dispatch(this->browser_);
	CComPtr<IUnknown> unknown(dispatch);
	HRESULT hr = this->DispEventAdvise(unknown);
}

void BrowserWrapper::DetachEvents() {
	CComQIPtr<IDispatch> dispatch(this->browser_);
	CComPtr<IUnknown> unknown(dispatch);
	HRESULT hr = this->DispEventUnadvise(unknown);
}

bool BrowserWrapper::Wait() {
	bool is_navigating = true;

	//std::cout << "Navigate Events Completed." << std::endl;
	this->is_navigation_started_ = false;

	HWND dialog = this->GetActiveDialogWindowHandle();
	if (dialog != NULL) {
		//std::cout "Found alert. Aborting wait." << std::endl;
		this->wait_required_ = false;
		return true;
	}

	// Navigate events completed. Waiting for browser.Busy != false...
	is_navigating = this->is_navigation_started_;
	VARIANT_BOOL is_busy(VARIANT_FALSE);
	HRESULT hr = this->browser_->get_Busy(&is_busy);
	if (is_navigating || FAILED(hr) || is_busy) {
		//std::cout << "Browser busy property is true.\r\n";
		return false;
	}

	// Waiting for browser.ReadyState == READYSTATE_COMPLETE...;
	is_navigating = this->is_navigation_started_;
	READYSTATE ready_state;
	hr = this->browser_->get_ReadyState(&ready_state);
	if (is_navigating || FAILED(hr) || ready_state != READYSTATE_COMPLETE) {
		//std::cout << "readyState is not 'Complete'.\r\n";
		return false;
	}

	// Waiting for document property != null...
	is_navigating = this->is_navigation_started_;
	CComQIPtr<IDispatch> document_dispatch;
	hr = this->browser_->get_Document(&document_dispatch);
	if (is_navigating && FAILED(hr) && !document_dispatch) {
		//std::cout << "Get Document failed.\r\n";
		return false;
	}

	// Waiting for document to complete...
	CComPtr<IHTMLDocument2> doc;
	hr = document_dispatch->QueryInterface(&doc);
	if (SUCCEEDED(hr)) {
		is_navigating = this->IsDocumentNavigating(doc);
	}

	if (!is_navigating) {
		this->wait_required_ = false;
	}

	return !is_navigating;
}

bool BrowserWrapper::IsDocumentNavigating(IHTMLDocument2 *doc) {
	bool is_navigating = true;
	// Starting WaitForDocumentComplete()
	is_navigating = this->is_navigation_started_;
	CComBSTR ready_state;
	HRESULT hr = doc->get_readyState(&ready_state);
	if (FAILED(hr) || is_navigating || _wcsicmp(ready_state, L"complete") != 0) {
		//std::cout << "readyState is not complete\r\n";
		return true;
	} else {
		is_navigating = false;
	}

	// document.readyState == complete
	is_navigating = this->is_navigation_started_;
	CComPtr<IHTMLFramesCollection2> frames;
	hr = doc->get_frames(&frames);
	if (is_navigating || FAILED(hr)) {
		//std::cout << "could not get frames\r\n";
		return true;
	}

	if (frames != NULL) {
		long frame_count = 0;
		hr = frames->get_length(&frame_count);

		CComVariant index;
		index.vt = VT_I4;
		for (long i = 0; i < frame_count; ++i) {
			// Waiting on each frame
			index.lVal = i;
			CComVariant result;
			hr = frames->item(&index, &result);
			if (FAILED(hr)) {
				return true;
			}

			CComQIPtr<IHTMLWindow2> window(result.pdispVal);
			if (!window) {
				// Frame is not an HTML frame.
				continue;
			}

			CComPtr<IHTMLDocument2> frame_document;
			hr = window->get_document(&frame_document);
			if (hr == E_ACCESSDENIED) {
				// Cross-domain documents may throw Access Denied. If so,
				// get the document through the IWebBrowser2 interface.
				CComPtr<IWebBrowser2> frame_browser;
				CComQIPtr<IServiceProvider> service_provider(window);
				hr = service_provider->QueryService(IID_IWebBrowserApp, &frame_browser);
				if (SUCCEEDED(hr))
				{
					CComQIPtr<IDispatch> frame_document_dispatch;
					hr = frame_browser->get_Document(&frame_document_dispatch);
					hr = frame_document_dispatch->QueryInterface(&frame_document);
				}
			}

			is_navigating = this->is_navigation_started_;
			if (is_navigating) {
				break;
			}

			// Recursively call to wait for the frame document to complete
			is_navigating = this->IsDocumentNavigating(frame_document);
			if (is_navigating) {
				break;
			}
		}
	}
	return is_navigating;
}

HWND BrowserWrapper::GetActiveDialogWindowHandle() {
	HWND active_dialog_handle = NULL;
	DWORD process_id;
	::GetWindowThreadProcessId(this->GetWindowHandle(), &process_id);
	ProcessWindowInfo process_win_info;
	process_win_info.dwProcessId = process_id;
	process_win_info.hwndBrowser = NULL;
	::EnumWindows(&BrowserFactory::FindDialogWindowForProcess, (LPARAM)&process_win_info);
	if (process_win_info.hwndBrowser != NULL) {
		active_dialog_handle = process_win_info.hwndBrowser;
	}
	return active_dialog_handle;
}

} // namespace webdriver