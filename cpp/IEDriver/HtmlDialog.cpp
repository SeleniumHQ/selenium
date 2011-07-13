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

#include "HtmlDialog.h"
#include "logging.h"

namespace webdriver {

HtmlDialog::HtmlDialog(IHTMLWindow2* window, HWND hwnd, HWND session_handle) : DocumentHost(hwnd, session_handle) {
	this->is_navigating_ = false;
	this->window_ = window;
	this->AttachEvents();
}

HtmlDialog::~HtmlDialog(void) {
	this->DetachEvents();
}

void HtmlDialog::AttachEvents() {
	CComQIPtr<IDispatch> dispatch(this->window_);
	CComPtr<IUnknown> unknown(dispatch);
	HRESULT hr = this->DispEventAdvise(unknown);
}

void HtmlDialog::DetachEvents() {
	CComQIPtr<IDispatch> dispatch(this->window_);
	CComPtr<IUnknown> unknown(dispatch);
	HRESULT hr = this->DispEventUnadvise(unknown);
}

void __stdcall HtmlDialog::OnBeforeUnload(IHTMLEventObj *pEvtObj) {
	this->is_navigating_ = true;
}

void __stdcall HtmlDialog::OnLoad(IHTMLEventObj *pEvtObj) {
	this->is_navigating_ = false;
}

void HtmlDialog::GetDocument(IHTMLDocument2** doc) {
	this->window_->get_document(doc);
}

void HtmlDialog::Close() {
	this->window_->close();
}

bool HtmlDialog::Wait() {
	// If the window handle is no longer valid, the wait is completed,
	// and we must post the quit message. Otherwise, we wait until
	// navigation is complete.
	if (!::IsWindow(this->GetTopLevelWindowHandle())) {
		this->is_navigating_ = false;
		this->PostQuitMessage();
		return true;
	}

	::Sleep(250);
	return !this->is_navigating_;
}

HWND HtmlDialog::GetWindowHandle() {
	return this->window_handle();
}

std::wstring HtmlDialog::GetWindowName() {
	return L"";
}

std::wstring HtmlDialog::GetTitle() {
	CComPtr<IHTMLDocument2> doc;
	this->GetDocument(&doc);
	CComBSTR title;
	HRESULT hr = doc->get_title(&title);
	if (FAILED(hr)) {
		LOGHR(WARN, hr) << "Unable to get document title";
		return L"";
	}

	std::wstring title_string(title);
	return title_string;
}

HWND HtmlDialog::GetTopLevelWindowHandle(void) {
	return ::GetParent(this->window_handle());
}

HWND HtmlDialog::GetActiveDialogWindowHandle() {
	DialogWindowInfo info;
	info.hwndOwner = this->GetTopLevelWindowHandle();
	info.hwndDialog = NULL;
	::EnumWindows(&HtmlDialog::FindChildDialogWindow, reinterpret_cast<LPARAM>(&info));
	return info.hwndDialog;
}

long HtmlDialog::GetWidth() {
	// TODO: calculate width
	return 0L;
}

long HtmlDialog::GetHeight() {
	// TODO: calculate height
	return 0L;
}

void HtmlDialog::SetWidth(long width) { 
}

void HtmlDialog::SetHeight(long height) {
}

int HtmlDialog::NavigateToUrl(const std::wstring& url) {
	// Cannot force navigation on windows opened with showModalDialog();
	return ENOTIMPLEMENTED;
}

int HtmlDialog::NavigateBack() {
	// Cannot force navigation on windows opened with showModalDialog();
	return ENOTIMPLEMENTED;
}

int HtmlDialog::NavigateForward() {
	// Cannot force navigation on windows opened with showModalDialog();
	return ENOTIMPLEMENTED;
}

int HtmlDialog::Refresh() {
	// Cannot force navigation on windows opened with showModalDialog();
	return ENOTIMPLEMENTED;
}

BOOL CALLBACK HtmlDialog::FindChildDialogWindow(HWND hwnd, LPARAM arg) {
	DialogWindowInfo* window_info = reinterpret_cast<DialogWindowInfo*>(arg);
	if (::GetWindow(hwnd, GW_OWNER) == window_info->hwndOwner) {
		window_info->hwndDialog = hwnd;
		return FALSE;
	}
	return TRUE;
}

} // namespace webdriver
