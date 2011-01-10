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

int BrowserWrapper::ExecuteScript(ScriptWrapper *script_wrapper) {
	VARIANT result;

	CComPtr<IHTMLDocument2> doc;
	this->GetDocument(&doc);
	if (!doc) {
		// LOG(WARN) << "Unable to get document reference";
		return EUNEXPECTEDJSERROR;
	}

	CComPtr<IDispatch> script_engine;
	HRESULT hr = doc->get_Script(&script_engine);
	if (FAILED(hr)) {
		// LOGHR(WARN, hr) << "Cannot obtain script engine";
		return EUNEXPECTEDJSERROR;
	}

	DISPID eval_id;
	bool added;
	bool ok = this->GetEvalMethod(doc, &eval_id, &added);

	if (!ok) {
		// LOG(WARN) << "Unable to locate eval method";
		if (added) { 
			this->RemoveScript(doc); 
		}
		return EUNEXPECTEDJSERROR;
	}

	CComVariant temp_function;
	if (!this->CreateAnonymousFunction(script_engine, eval_id, &script_wrapper->script(), &temp_function)) {
		// Debug level since this is normally the point we find out that 
		// a page refresh has occured. *sigh*
		//LOG(DEBUG) << "Cannot create anonymous function: " << _bstr_t(script) << endl;
		if (added) { 
			this->RemoveScript(doc); 
		}
		return EUNEXPECTEDJSERROR;
	}

	if (temp_function.vt != VT_DISPATCH) {
		// No return value that we care about
		::VariantClear(&result);
		result.vt = VT_EMPTY;
		if (added) { 
			this->RemoveScript(doc); 
		}
		return SUCCESS;
	}

	// Grab the "call" method out of the returned function
	DISPID call_member_id;
	OLECHAR FAR* call_member_name = L"call";
	hr = temp_function.pdispVal->GetIDsOfNames(IID_NULL, &call_member_name, 1, LOCALE_USER_DEFAULT, &call_member_id);
	if (FAILED(hr)) {
		if (added) { 
			this->RemoveScript(doc); 
		}
		//LOGHR(DEBUG, hr) << "Cannot locate call method on anonymous function: " << _bstr_t(script) << endl;
		return EUNEXPECTEDJSERROR;
	}

	DISPPARAMS call_parameters = { 0 };
	memset(&call_parameters, 0, sizeof call_parameters);

	long lower = 0;
	::SafeArrayGetLBound(script_wrapper->arguments(), 1, &lower);
	long upper = 0;
	::SafeArrayGetUBound(script_wrapper->arguments(), 1, &upper);
	long nargs = 1 + upper - lower;
	call_parameters.cArgs = nargs + 1;

	CComPtr<IHTMLWindow2> win;
	hr = doc->get_parentWindow(&win);
	if (FAILED(hr)) {
		if (added) { 
			this->RemoveScript(doc); 
		}
		//LOGHR(WARN, hr) << "Cannot get parent window";
		return EUNEXPECTEDJSERROR;
	}
	_variant_t *vargs = new _variant_t[nargs + 1];
	::VariantCopy(&(vargs[nargs]), &CComVariant(win));

	long index;
	for (int i = 0; i < nargs; i++) {
		index = i;
		CComVariant v;
		::SafeArrayGetElement(script_wrapper->arguments(), &index, (void*) &v);
		::VariantCopy(&(vargs[nargs - 1 - i]), &v);
	}

	call_parameters.rgvarg = vargs;

	EXCEPINFO exception;
	memset(&exception, 0, sizeof exception);
	hr = temp_function.pdispVal->Invoke(call_member_id, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_METHOD, &call_parameters, 
		&result,
		&exception, 0);
	if (FAILED(hr)) {
		CComBSTR errorDescription(exception.bstrDescription);
		if (DISP_E_EXCEPTION == hr)  {
			//LOG(INFO) << "Exception message was: " << _bstr_t(exception.bstrDescription);
		} else {
			//LOGHR(DEBUG, hr) << "Failed to execute: " << _bstr_t(script);
			if (added) { 
				this->RemoveScript(doc); 
			}
			return EUNEXPECTEDJSERROR;
		}

		::VariantClear(&result);
		result.vt = VT_USERDEFINED;
		if (exception.bstrDescription != NULL) {
			result.bstrVal = ::SysAllocStringByteLen((char*)exception.bstrDescription, ::SysStringByteLen(exception.bstrDescription));
		} else {
			result.bstrVal = ::SysAllocStringByteLen(NULL, 0);
		}
		wcout << _bstr_t(exception.bstrDescription) << endl;
	}

	// If the script returned an IHTMLElement, we need to copy it to make it valid.
	if(VT_DISPATCH == result.vt) {
		CComQIPtr<IHTMLElement> element(result.pdispVal);
		if(element) {
			IHTMLElement* &dom_element = * (IHTMLElement**) &(result.pdispVal);
			element.CopyTo(&dom_element);
		}
	}

	script_wrapper->set_result(result);

	if (added) { 
		this->RemoveScript(doc); 
	}

	delete[] vargs;

	return SUCCESS;
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
	// Inject the XPath engine
	std::wstring script;
	for (int i = 0; DELETECOOKIES[i]; i++) {
		script += DELETECOOKIES[i];
	}

	ScriptWrapper *script_wrapper = new ScriptWrapper(script, 1);
	script_wrapper->AddArgument(cookie_name);
	int status_code = this->ExecuteScript(script_wrapper);
	delete script_wrapper;

	return status_code;
}

void BrowserWrapper::AttachToWindowInputQueue() {
	// This function should not be necessary, but it is
	// for cases like sending backspaces to input elements
	// (which are often interpreted as backspace keystrokes
	// to the window, which will navigate back in the history).
	HWND top_level_window_handle = NULL;
	this->browser_->get_HWND(reinterpret_cast<SHANDLE_PTR*>(&top_level_window_handle));

	DWORD ie_thread_id = ::GetWindowThreadProcessId(top_level_window_handle, NULL);
	DWORD current_thread_id = ::GetCurrentThreadId();
    if( ie_thread_id != current_thread_id ) {
		::AttachThreadInput(current_thread_id, ie_thread_id, true);
    }

	::SetActiveWindow(top_level_window_handle);

	if(ie_thread_id != current_thread_id ) {
		::AttachThreadInput(current_thread_id, ie_thread_id, false);
    }
}

bool BrowserWrapper::IsHtmlPage(IHTMLDocument2* doc) {
	CComBSTR type;
	if (!SUCCEEDED(doc->get_mimeType(&type))) {
		return false;
	}

	if (!SUCCEEDED(type.ToLower())) {
		return false;
	}

	std::wstring type_string((BSTR)type);
	return wcsstr(type_string.c_str(), L"html") != NULL;
}

bool BrowserWrapper::GetEvalMethod(IHTMLDocument2* doc, DISPID* eval_id, bool* added) {
	CComPtr<IDispatch> script_engine;
	doc->get_Script(&script_engine);

	OLECHAR FAR* eval_method_name = L"eval";
	HRESULT hr = script_engine->GetIDsOfNames(IID_NULL, &eval_method_name, 1, LOCALE_USER_DEFAULT, eval_id);
	if (FAILED(hr)) {
		*added = true;
		// Start the script engine by adding a script tag to the page
		CComPtr<IHTMLElement> script_tag;
		hr = doc->createElement(L"span", &script_tag);
		if (FAILED(hr)) {
			//LOGHR(WARN, hr) << "Failed to create span tag";
		}
		CComBSTR element_html(L"<span id='__webdriver_private_span'>&nbsp;<script defer></script></span>");
		script_tag->put_innerHTML(element_html);

		CComPtr<IHTMLElement> body;
		hr = doc->get_body(&body);
		if (FAILED(hr) || body == NULL) {
			// We have no body element, so there's nothing more we can do here.
			// TODO: This may be a transient state of affairs. A wait-and-retry
			// approach may be successful, but a timeout would be required.
			return false;
		}

		CComQIPtr<IHTMLDOMNode> node(body);
		CComQIPtr<IHTMLDOMNode> script_node(script_tag);

		CComPtr<IHTMLDOMNode> generated_child;
		node->appendChild(script_node, &generated_child);

		script_engine.Release();
		doc->get_Script(&script_engine);
		hr = script_engine->GetIDsOfNames(IID_NULL, &eval_method_name, 1, LOCALE_USER_DEFAULT, eval_id);

		if (FAILED(hr)) {
			this->RemoveScript(doc);
			return false;
		}
	}

	return true;
}

bool BrowserWrapper::CreateAnonymousFunction(IDispatch* script_engine, DISPID eval_id, const std::wstring *script, VARIANT* result) {
	CComVariant script_variant(script->c_str());
	DISPPARAMS parameters = {0};
	memset(&parameters, 0, sizeof parameters);
	parameters.cArgs      = 1;
	parameters.rgvarg     = &script_variant;
	parameters.cNamedArgs = 0;

	EXCEPINFO exception;
	memset(&exception, 0, sizeof exception);

	HRESULT hr = script_engine->Invoke(eval_id, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_METHOD, &parameters, result, &exception, 0);
	if (FAILED(hr)) {
		if (DISP_E_EXCEPTION == hr) 
		{
			// LOGHR(INFO, hr) << "Exception message was: " << _bstr_t(exception.bstrDescription) << ": " << _bstr_t(script);
		} else {
			// LOGHR(DEBUG, hr) << "Failed to compile: " << script;
		}

		if (result) {
			result->vt = VT_USERDEFINED;
			if (exception.bstrDescription != NULL) {
				result->bstrVal = ::SysAllocStringByteLen((char*)exception.bstrDescription, ::SysStringByteLen(exception.bstrDescription));
			} else {
				result->bstrVal = ::SysAllocStringByteLen(NULL, 0);
			}
		}

		return false;
	}

	return true;
}

void BrowserWrapper::RemoveScript(IHTMLDocument2 *doc) {
	CComQIPtr<IHTMLDocument3> doc3(doc);

	if (!doc3) {
		return;
	}

	CComPtr<IHTMLElement> element;
	CComBSTR id(L"__webdriver_private_span");
	HRESULT hr = doc3->getElementById(id, &element);
	if (FAILED(hr)) {
		// LOGHR(WARN, hr) << "Cannot find the script tag. Bailing.";
		return;
	}

	CComQIPtr<IHTMLDOMNode> element_node(element);

	if (element_node) {
		CComPtr<IHTMLElement> body;
		hr = doc->get_body(&body);
		if (FAILED(hr)) {
			// LOGHR(WARN, hr) << "Cannot locate body of document";
			return;
		}
		CComQIPtr<IHTMLDOMNode> body_node(body);
		if (!body_node) {
			// LOG(WARN) << "Cannot cast body to a standard html node";
			return;
		}
		CComPtr<IHTMLDOMNode> removed;
		hr = body_node->removeChild(element_node, &removed);
		if (FAILED(hr)) {
			// LOGHR(DEBUG, hr) << "Cannot remove child node. Shouldn't matter. Bailing";
		}
	}
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