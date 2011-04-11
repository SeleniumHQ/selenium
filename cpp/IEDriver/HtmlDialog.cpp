#include "StdAfx.h"
#include "HtmlDialog.h"
#include "logging.h"

namespace webdriver {

HtmlDialog::HtmlDialog(IHTMLDocument2* document, HWND hwnd, HWND session_handle) : HtmlWindow(hwnd, session_handle) {
	this->document_ = document;
}

HtmlDialog::~HtmlDialog(void) {
}

void __stdcall HtmlDialog::OnUnload(IHTMLEventObj *pEvtObj) {
}

void HtmlDialog::GetDocument(IHTMLDocument2** doc) {
	*doc = this->document_;
}

void HtmlDialog::Close() {
	this->document_->close();
}

bool HtmlDialog::Wait() {
	::Sleep(250);
	return false;
}

HWND HtmlDialog::GetWindowHandle() {
	return this->window_handle();
}

std::wstring HtmlDialog::GetWindowName() {
	return L"";
}

std::wstring HtmlDialog::GetTitle() {
	CComBSTR title;
	HRESULT hr = this->document_->get_title(&title);
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
