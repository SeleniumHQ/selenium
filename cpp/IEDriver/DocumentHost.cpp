// Copyright 2011 WebDriver committers
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#include "DocumentHost.h"
#include "Generated/cookies.h"
#include "messages.h"

namespace webdriver {

DocumentHost::DocumentHost(HWND hwnd, HWND executor_handle) {
	// NOTE: COM should be initialized on this thread, so we
	// could use CoCreateGuid() and StringFromGUID2() instead.
	UUID guid;
	RPC_WSTR guid_string = NULL;
	RPC_STATUS status = ::UuidCreate(&guid);
	status = ::UuidToString(&guid, &guid_string);

	// RPC_WSTR is currently typedef'd in RpcDce.h (pulled in by rpc.h)
	// as unsigned short*. It needs to be typedef'd as wchar_t* 
	wchar_t* cast_guid_string = reinterpret_cast<wchar_t*>(guid_string);
	this->browser_id_ = cast_guid_string;

	::RpcStringFree(&guid_string);

	this->window_handle_ = hwnd;
	this->executor_handle_ = executor_handle;
	this->is_closing_ = false;
	this->wait_required_ = false;
	this->focused_frame_window_ = NULL;
}

DocumentHost::~DocumentHost(void) {
}

int DocumentHost::SetFocusedFrameByElement(IHTMLElement* frame_element) {
	HRESULT hr = S_OK;
	if (!frame_element) {
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

	this->focused_frame_window_ = interim_result;
	return SUCCESS;
}

int DocumentHost::SetFocusedFrameByName(const std::wstring& frame_name) {
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
	hr = name_bstr.CopyTo(&name);

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

	this->focused_frame_window_ = interim_result;
	return SUCCESS;
}

int DocumentHost::SetFocusedFrameByIndex(const int frame_index) {
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

	this->focused_frame_window_ = interim_result;
	return SUCCESS;
}

std::wstring DocumentHost::GetCookies() {
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

	std::wstring cookie_string = cookie;
	return cookie_string;
}

int DocumentHost::AddCookie(const std::wstring& cookie) {
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

int DocumentHost::DeleteCookie(const std::wstring& cookie_name) {
	// Construct the delete cookie script
	std::wstring script_source;
	for (int i = 0; DELETECOOKIES[i]; i++) {
		script_source += DELETECOOKIES[i];
	}

	CComPtr<IHTMLDocument2> doc;
	this->GetDocument(&doc);
	Script script_wrapper(doc, script_source, 1);
	script_wrapper.AddArgument(cookie_name);
	int status_code = script_wrapper.Execute();
	return status_code;
}

void DocumentHost::PostQuitMessage() {
	this->set_is_closing(true);
	LPWSTR message_payload = new WCHAR[this->browser_id_.size() + 1];
	wcscpy_s(message_payload, this->browser_id_.size() + 1, this->browser_id_.c_str());
	::PostMessage(this->executor_handle(), WD_BROWSER_QUIT, NULL, reinterpret_cast<LPARAM>(message_payload));
}

bool DocumentHost::IsHtmlPage(IHTMLDocument2* doc) {
	CComBSTR type;
	if (!SUCCEEDED(doc->get_mimeType(&type))) {
		return false;
	}

	std::wstring document_type_key_name= L"";
	if (this->factory_.GetRegistryValue(HKEY_CURRENT_USER, L"Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\http\\UserChoice", L"Progid", &document_type_key_name)) {
		// Look for the user-customization under Vista/Windows 7 first. If it's
		// IE, set the document friendly name lookup key to 'htmlfile'. If not,
		// set it to blank so that we can look up the proper HTML type.
		if (document_type_key_name == L"IE.HTTP") {
			document_type_key_name = L"htmlfile";
		} else {
			document_type_key_name = L"";
		}
	}

	if (document_type_key_name == L"") {
		// To be technically correct, we should look up the extension specified
		// for the text/html MIME type first (located in the "Extension" value
		// of HKEY_CLASSES_ROOT\MIME\Database\Content Type\text/html), but that
		// should always resolve to ".htm" anyway. From the extension, we can 
		// find the browser-specific subkey of HKEY_CLASSES_ROOT, the default 
		// value of which should contain the browser-specific friendly name of
		// the MIME type for HTML documents, which is what 
		// IHTMLDocument2::get_mimeType() returns.
		if (!this->factory_.GetRegistryValue(HKEY_CLASSES_ROOT, L".htm", L"", &document_type_key_name)) {
			return false;
		}
	}

	std::wstring mime_type_name;
	if (!this->factory_.GetRegistryValue(HKEY_CLASSES_ROOT, document_type_key_name, L"", &mime_type_name)) {
		return false;
	}

	std::wstring type_string = type;
	return type_string == mime_type_name;
}


} // namespace webdriver