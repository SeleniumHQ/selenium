#include "StdAfx.h"
#include "BrowserManager.h"
#include "AddCookieCommandHandler.h"
#include "ClickElementCommandHandler.h"
#include "ClearElementCommandHandler.h"
#include "CloseWindowCommandHandler.h"
#include "DeleteAllCookiesCommandHandler.h"
#include "DeleteCookieCommandHandler.h"
#include "DragElementCommandHandler.h"
#include "ElementEqualsCommandHandler.h"
#include "ExecuteAsyncScriptCommandHandler.h"
#include "ExecuteScriptCommandHandler.h"
#include "FindByCssSelectorElementFinder.h"
#include "FindByXPathElementFinder.h"
#include "FindChildElementCommandHandler.h"
#include "FindChildElementsCommandHandler.h"
#include "FindElementCommandHandler.h"
#include "FindElementsCommandHandler.h"
#include "GetActiveElementCommandHandler.h"
#include "GetAllCookiesCommandHandler.h"
#include "GetAllWindowHandlesCommandHandler.h"
#include "GetCurrentUrlCommandHandler.h"
#include "GetCurrentWindowHandleCommandHandler.h"
#include "GetElementAttributeCommandHandler.h"
#include "GetElementLocationCommandHandler.h"
#include "GetElementLocationOnceScrolledIntoViewCommandHandler.h"
#include "GetElementSizeCommandHandler.h"
#include "GetElementTagNameCommandHandler.h"
#include "GetElementTextCommandHandler.h"
#include "GetElementValueCommandHandler.h"
#include "GetElementValueOfCssPropertyCommandHandler.h"
#include "GetSessionCapabilitiesCommandHandler.h"
#include "GetSpeedCommandHandler.h"
#include "GetPageSourceCommandHandler.h"
#include "GetTitleCommandHandler.h"
#include "GoBackCommandHandler.h"
#include "GoForwardCommandHandler.h"
#include "GoToUrlCommandHandler.h"
#include "HoverOverElementCommandHandler.h"
#include "IsElementDisplayedCommandHandler.h"
#include "IsElementEnabledCommandHandler.h"
#include "IsElementSelectedCommandHandler.h"
#include "NewSessionCommandHandler.h"
#include "RefreshCommandHandler.h"
#include "ScreenshotCommandHandler.h"
#include "SendKeysCommandHandler.h"
#include "SetAsyncScriptTimeoutCommandHandler.h"
#include "SetElementSelectedCommandHandler.h"
#include "SetImplicitWaitTimeoutCommandHandler.h"
#include "SetSpeedCommandHandler.h"
#include "SubmitElementCommandHandler.h"
#include "SwitchToFrameCommandHandler.h"
#include "SwitchToWindowCommandHandler.h"
#include "ToggleElementCommandHandler.h"
#include "QuitCommandHandler.h"

#include "AcceptAlertCommandHandler.h"
#include "DismissAlertCommandHandler.h"
#include "GetAlertTextCommandHandler.h"
#include "SendKeysToAlertCommandHandler.h"

#include "SendModifierKeyCommandHandler.h"
#include "MouseMoveToCommandHandler.h"
#include "MouseClickCommandHandler.h"
#include "MouseDoubleClickCommandHandler.h"
#include "MouseButtonDownCommandHandler.h"
#include "MouseButtonUpCommandHandler.h"

namespace webdriver {

LRESULT BrowserManager::OnInit(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled) {
	// If we wanted to be a little more clever, we could create a struct 
	// containing the HWND and the port number and pass them into the
	// ThreadProc via lpParameter and avoid this message handler altogether.
	this->port_ = (int)wParam;
	return 0;
}

LRESULT BrowserManager::OnCreate(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled) {
	// NOTE: COM should be initialized on this thread, so we
	// could use CoCreateGuid() and StringFromGUID2() instead.
	UUID guid;
	RPC_WSTR guid_string = NULL;
	::UuidCreate(&guid);
	::UuidToString(&guid, &guid_string);

	// RPC_WSTR is currently typedef'd in RpcDce.h (pulled in by rpc.h)
	// as unsigned short*. It needs to be typedef'd as wchar_t* 
	wchar_t* cast_guid_string = reinterpret_cast<wchar_t*>(guid_string);
	this->manager_id_ = cast_guid_string;

	::RpcStringFree(&guid_string);
	this->SetWindowText(this->manager_id_.c_str());

	this->PopulateCommandHandlerRepository();
	this->PopulateElementFinderRepository();
	this->current_browser_id_ = L"";
	this->serialized_response_ = L"";
	this->speed_ = 0;
	this->implicit_wait_timeout_ = 0;
	this->last_known_mouse_x_ = 0;
	this->last_known_mouse_y_ = 0;
	return 0;
}

LRESULT BrowserManager::OnClose(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled) {
	this->DestroyWindow();
	return 0;
}

LRESULT BrowserManager::OnDestroy(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled) {
	::PostQuitMessage(0);
	return 0;
}

LRESULT BrowserManager::OnSetCommand(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled) {
	LPCTSTR raw_command = (LPCTSTR)lParam;
	std::wstring json_command(raw_command);

	// JsonCpp only understands narrow strings, so we have to convert.
	std::string converted_command(CW2A(json_command.c_str(), CP_UTF8));
	this->current_command_.Populate(converted_command);
	return 0;
}

LRESULT BrowserManager::OnExecCommand(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled) {
	this->DispatchCommand();
	return 0;
}

LRESULT BrowserManager::OnGetResponseLength(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled) {
	size_t response_length = 0;
	if (!this->is_waiting_) {
		response_length = this->serialized_response_.size();
	}
	return response_length;
}

LRESULT BrowserManager::OnGetResponse(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled) {
	LPWSTR str = (LPWSTR)lParam;
	wcscpy_s(str, this->serialized_response_.size() + 1, this->serialized_response_.c_str());

	// Reset the serialized response for the next command.
	this->serialized_response_ = L"";
	return 0;
}

LRESULT BrowserManager::OnWait(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled) {
	BrowserWrapper *browser;
	int status_code = this->GetCurrentBrowser(&browser);
	if (status_code == SUCCESS && !browser->is_closing()) {
		this->is_waiting_ = !(browser->Wait());
		if (this->is_waiting_) {
			// If we are still waiting, we need to wait a bit then post a message to
			// ourselves to run the wait again. However, we can't wait using Sleep()
			// on this thread. This call happens in a message loop, and we would be 
			// unable to process the COM events in the browser if we put this thread
			// to sleep.
			DWORD thread_id;
			HANDLE thread_handle = ::CreateThread(NULL, 0, &BrowserManager::WaitThreadProc, (LPVOID)this->m_hWnd, 0, &thread_id);
			if (thread_handle != NULL) {
				::CloseHandle(thread_handle);
			}
		}
	} else {
		this->is_waiting_ = false;
	}
	return 0;
}

LRESULT BrowserManager::OnBrowserNewWindow(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled) {
	IWebBrowser2* browser = this->factory_.CreateBrowser();
	BrowserWrapper* new_window_wrapper = new BrowserWrapper(browser, NULL, this->m_hWnd);
	this->AddManagedBrowser(new_window_wrapper);
	LPSTREAM* stream = (LPSTREAM*)lParam;
	HRESULT hr = ::CoMarshalInterThreadInterfaceInStream(IID_IWebBrowser2, browser, stream);
	return 0;
}

LRESULT BrowserManager::OnBrowserQuit(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled) {
	LPCTSTR str = (LPCTSTR)lParam;
	std::wstring browser_id(str);
	delete[] str;
	std::tr1::unordered_map<std::wstring, BrowserWrapper*>::iterator found_iterator = this->managed_browsers_.find(browser_id);
	if (found_iterator != this->managed_browsers_.end()) {
		//delete found_iterator->second;
		this->managed_browsers_.erase(browser_id);
		if (this->managed_browsers_.size() == 0) {
			this->current_browser_id_ = L"";
		}
	}
	return 0;
}

DWORD WINAPI BrowserManager::WaitThreadProc(LPVOID lpParameter) {
	HWND window_handle = (HWND)lpParameter;
	::Sleep(WAIT_TIME_IN_MILLISECONDS);
	::PostMessage(window_handle, WD_WAIT, NULL, NULL);
	return 0;
}


DWORD WINAPI BrowserManager::ThreadProc(LPVOID lpParameter) {
	// Optional TODO: Create a struct to pass in via lpParameter
	// instead of just a pointer to an HWND. That way, we could
	// pass the mongoose server port via a single call, rather than
	// having to send an init message after the window is created.
	HWND *window_handle = (HWND *)lpParameter;
	DWORD error = 0;
	HRESULT hr = ::CoInitializeEx(NULL, COINIT_APARTMENTTHREADED);
	BrowserManager manager;
	HWND manager_handle = manager.Create(HWND_MESSAGE, CWindow::rcDefault);
	if (manager_handle == NULL) {
		error = ::GetLastError();
	}

	// Return the HWND back through lpParameter, and signal that the
	// window is ready for messages.
	*window_handle = manager_handle;
	HANDLE event_handle = ::OpenEvent(EVENT_ALL_ACCESS, FALSE, EVENT_NAME);
	if (event_handle != NULL) {
		::SetEvent(event_handle);
		::CloseHandle(event_handle);
	}

    // Run the message loop
	MSG msg;
	while (::GetMessage(&msg, NULL, 0, 0) > 0) {
		::TranslateMessage(&msg);
		::DispatchMessage(&msg);
	}

	::CoUninitialize();
	return 0;
}

void BrowserManager::DispatchCommand() {
	std::string session_id = CW2A(this->manager_id_.c_str(), CP_UTF8);
	WebDriverResponse response(session_id);
	std::map<int, std::tr1::shared_ptr<WebDriverCommandHandler>>::const_iterator found_iterator = this->command_handlers_.find(this->current_command_.command_value());

	if (found_iterator == this->command_handlers_.end()) {
		response.SetErrorResponse(501, "Command not implemented");
	} else {
		std::tr1::shared_ptr<WebDriverCommandHandler> command_handler = found_iterator->second;
		command_handler->Execute(this, this->current_command_, &response);

		BrowserWrapper *browser;
		int status_code = this->GetCurrentBrowser(&browser);
		if (status_code == SUCCESS) {
			this->is_waiting_ = browser->wait_required();
			if (this->is_waiting_) {
				::PostMessage(this->m_hWnd, WD_WAIT, NULL, NULL);
			}
		}
	}

	this->serialized_response_ = response.Serialize();
}

int BrowserManager::GetCurrentBrowser(BrowserWrapper **browser_wrapper) {
	return this->GetManagedBrowser(this->current_browser_id_, browser_wrapper);
}

int BrowserManager::GetManagedBrowser(std::wstring browser_id, BrowserWrapper **browser_wrapper) {
	if (browser_id == L"") {
		return ENOSUCHDRIVER;
	}

	std::tr1::unordered_map<std::wstring, BrowserWrapper*>::iterator found_iterator = this->managed_browsers_.find(browser_id);
	if (found_iterator == this->managed_browsers_.end()) {
		return ENOSUCHDRIVER;
	}

	*browser_wrapper = found_iterator->second;
	return SUCCESS;
}

void BrowserManager::GetManagedBrowserHandles(std::vector<std::wstring> *managed_browser_handles) {
	// TODO: Enumerate windows looking for browser windows
	// created by showModalDialog().
	std::tr1::unordered_map<std::wstring, BrowserWrapper*>::iterator it = this->managed_browsers_.begin();
	for (; it != this->managed_browsers_.end(); ++it) {
		managed_browser_handles->push_back(it->first);
	}
}

void BrowserManager::AddManagedBrowser(BrowserWrapper *browser_wrapper) {
	this->managed_browsers_[browser_wrapper->browser_id()] = browser_wrapper;
	if (this->current_browser_id_ == L"") {
		this->current_browser_id_ = browser_wrapper->browser_id();
	}
}

void BrowserManager::CreateNewBrowser(void) {
	DWORD dwProcId = this->factory_.LaunchBrowserProcess(this->port_);
	ProcessWindowInfo process_window_info;
	process_window_info.dwProcessId = dwProcId;
	process_window_info.hwndBrowser = NULL;
	process_window_info.pBrowser = NULL;
	this->factory_.AttachToBrowser(&process_window_info);
	BrowserWrapper *wrapper = new BrowserWrapper(process_window_info.pBrowser, process_window_info.hwndBrowser, this->m_hWnd);
	this->AddManagedBrowser(wrapper);
}

int BrowserManager::GetManagedElement(std::wstring element_id, ElementWrapper **element_wrapper) {
	std::tr1::unordered_map<std::wstring, ElementWrapper*>::iterator found_iterator = this->managed_elements_.find(element_id);
	if (found_iterator == this->managed_elements_.end()) {
		return ENOSUCHELEMENT;
	}

	*element_wrapper = found_iterator->second;
	return SUCCESS;
}

void BrowserManager::AddManagedElement(IHTMLElement *element, ElementWrapper **element_wrapper) {
	// TODO: This method needs much work. If we are already managing a
	// given element, we don't want to assign it a new ID, but to find
	// out if we're managing it already, we need to compare to all of 
	// the elements already in our map, which means iterating through
	// the map. For long-running tests, this means the addition of a
	// new managed element may take longer and longer as we have no
	// good algorithm for removing dead elements from the map.
	bool element_already_managed(false);
	std::tr1::unordered_map<std::wstring, ElementWrapper*>::iterator it = this->managed_elements_.begin();
	for (; it != this->managed_elements_.end(); ++it) {
		if (it->second->element() == element) {
			*element_wrapper = it->second;
			element_already_managed = true;
			break;
		}
	}

	if (!element_already_managed) {
		BrowserWrapper *current_browser;
		this->GetCurrentBrowser(&current_browser);
		ElementWrapper *new_wrapper = new ElementWrapper(element, current_browser->GetWindowHandle());
		this->managed_elements_[new_wrapper->element_id()] = new_wrapper;
		*element_wrapper = new_wrapper;
	}
}

void BrowserManager::RemoveManagedElement(std::wstring element_id) {
	std::tr1::unordered_map<std::wstring, ElementWrapper*>::iterator found_iterator = this->managed_elements_.find(element_id);
	if (found_iterator != this->managed_elements_.end()) {
		ElementWrapper *element_wrapper = found_iterator->second;
		this->managed_elements_.erase(element_id);
		delete element_wrapper;
	}
}

void BrowserManager::ListManagedElements() {
	std::tr1::unordered_map<std::wstring, ElementWrapper*>::iterator it = this->managed_elements_.begin();
	for (; it != this->managed_elements_.end(); ++it) {
		std::string id(CW2A(it->first.c_str(), CP_UTF8));
		std::cout << id << "\n";
	}
}

int BrowserManager::GetElementFinder(std::wstring mechanism, std::tr1::shared_ptr<ElementFinder>* finder) {
	std::map<std::wstring, std::tr1::shared_ptr<ElementFinder>>::const_iterator found_iterator = this->element_finders_.find(mechanism);
	if (found_iterator == this->element_finders_.end()) {
		return EUNHANDLEDERROR;
	}

	*finder = found_iterator->second;
	return SUCCESS;
}

void BrowserManager::PopulateElementFinderRepository(void) {
	// TODO (JimEvans): This is left over from a previous method of finding
	// elements. This needs to be completely refactored.
	this->element_finders_[L"id"] = std::tr1::shared_ptr<ElementFinder>(new ElementFinder(L"id"));
	this->element_finders_[L"name"] = std::tr1::shared_ptr<ElementFinder>(new ElementFinder(L"name"));
	this->element_finders_[L"tag name"] = std::tr1::shared_ptr<ElementFinder>(new ElementFinder(L"tagName"));
	this->element_finders_[L"link text"] = std::tr1::shared_ptr<ElementFinder>(new ElementFinder(L"linkText"));
	this->element_finders_[L"partial link text"] = std::tr1::shared_ptr<ElementFinder>(new ElementFinder(L"partialLinkText"));
	this->element_finders_[L"class name"] = std::tr1::shared_ptr<ElementFinder>(new ElementFinder(L"className"));
	this->element_finders_[L"xpath"] = std::tr1::shared_ptr<ElementFinder>(new FindByXPathElementFinder(L"xpath"));
	this->element_finders_[L"css selector"] = std::tr1::shared_ptr<ElementFinder>(new FindByCssSelectorElementFinder(L"css"));
}

void BrowserManager::PopulateCommandHandlerRepository() {
	this->command_handlers_[NoCommand] = std::tr1::shared_ptr<WebDriverCommandHandler>(new WebDriverCommandHandler);
	this->command_handlers_[GetCurrentWindowHandle] = std::tr1::shared_ptr<WebDriverCommandHandler>(new GetCurrentWindowHandleCommandHandler);
	this->command_handlers_[GetWindowHandles] = std::tr1::shared_ptr<WebDriverCommandHandler>(new GetAllWindowHandlesCommandHandler);
	this->command_handlers_[SwitchToWindow] = std::tr1::shared_ptr<WebDriverCommandHandler>(new SwitchToWindowCommandHandler);
	this->command_handlers_[SwitchToFrame] = std::tr1::shared_ptr<WebDriverCommandHandler>(new SwitchToFrameCommandHandler);
	this->command_handlers_[Get] = std::tr1::shared_ptr<WebDriverCommandHandler>(new GoToUrlCommandHandler);
	this->command_handlers_[GoForward] = std::tr1::shared_ptr<WebDriverCommandHandler>(new GoForwardCommandHandler);
	this->command_handlers_[GoBack] = std::tr1::shared_ptr<WebDriverCommandHandler>(new GoBackCommandHandler);
	this->command_handlers_[Refresh] = std::tr1::shared_ptr<WebDriverCommandHandler>(new RefreshCommandHandler);
	this->command_handlers_[GetSpeed] = std::tr1::shared_ptr<WebDriverCommandHandler>(new GetSpeedCommandHandler);
	this->command_handlers_[SetSpeed] = std::tr1::shared_ptr<WebDriverCommandHandler>(new SetSpeedCommandHandler);
	this->command_handlers_[ImplicitlyWait] = std::tr1::shared_ptr<WebDriverCommandHandler>(new SetImplicitWaitTimeoutCommandHandler);
	this->command_handlers_[SetAsyncScriptTimeout] = std::tr1::shared_ptr<WebDriverCommandHandler>(new SetAsyncScriptTimeoutCommandHandler);
	this->command_handlers_[NewSession] = std::tr1::shared_ptr<WebDriverCommandHandler>(new NewSessionCommandHandler);
	this->command_handlers_[GetSessionCapabilities] = std::tr1::shared_ptr<WebDriverCommandHandler>(new GetSessionCapabilitiesCommandHandler);
	this->command_handlers_[Close] = std::tr1::shared_ptr<WebDriverCommandHandler>(new CloseWindowCommandHandler);
	this->command_handlers_[Quit] = std::tr1::shared_ptr<WebDriverCommandHandler>(new QuitCommandHandler);
	this->command_handlers_[GetTitle] = std::tr1::shared_ptr<WebDriverCommandHandler>(new GetTitleCommandHandler);
	this->command_handlers_[GetPageSource] = std::tr1::shared_ptr<WebDriverCommandHandler>(new GetPageSourceCommandHandler);
	this->command_handlers_[GetCurrentUrl] = std::tr1::shared_ptr<WebDriverCommandHandler>(new GetCurrentUrlCommandHandler);
	this->command_handlers_[ExecuteAsyncScript] = std::tr1::shared_ptr<WebDriverCommandHandler>(new ExecuteAsyncScriptCommandHandler);
	this->command_handlers_[ExecuteScript] = std::tr1::shared_ptr<WebDriverCommandHandler>(new ExecuteScriptCommandHandler);
	this->command_handlers_[GetActiveElement] = std::tr1::shared_ptr<WebDriverCommandHandler>(new GetActiveElementCommandHandler);
	this->command_handlers_[FindElement] = std::tr1::shared_ptr<WebDriverCommandHandler>(new FindElementCommandHandler);
	this->command_handlers_[FindElements] = std::tr1::shared_ptr<WebDriverCommandHandler>(new FindElementsCommandHandler);
	this->command_handlers_[FindChildElement] = std::tr1::shared_ptr<WebDriverCommandHandler>(new FindChildElementCommandHandler);
	this->command_handlers_[FindChildElements] = std::tr1::shared_ptr<WebDriverCommandHandler>(new FindChildElementsCommandHandler);
	this->command_handlers_[GetElementTagName] = std::tr1::shared_ptr<WebDriverCommandHandler>(new GetElementTagNameCommandHandler);
	this->command_handlers_[GetElementLocation] = std::tr1::shared_ptr<WebDriverCommandHandler>(new GetElementLocationCommandHandler);
	this->command_handlers_[GetElementSize] = std::tr1::shared_ptr<WebDriverCommandHandler>(new GetElementSizeCommandHandler);
	this->command_handlers_[GetElementLocationOnceScrolledIntoView] = std::tr1::shared_ptr<WebDriverCommandHandler>(new GetElementLocationOnceScrolledIntoViewCommandHandler);
	this->command_handlers_[GetElementAttribute] = std::tr1::shared_ptr<WebDriverCommandHandler>(new GetElementAttributeCommandHandler);
	this->command_handlers_[GetElementText] = std::tr1::shared_ptr<WebDriverCommandHandler>(new GetElementTextCommandHandler);
	this->command_handlers_[GetElementValueOfCssProperty] = std::tr1::shared_ptr<WebDriverCommandHandler>(new GetElementValueOfCssPropertyCommandHandler);
	this->command_handlers_[GetElementValue] = std::tr1::shared_ptr<WebDriverCommandHandler>(new GetElementValueCommandHandler);
	this->command_handlers_[ClickElement] = std::tr1::shared_ptr<WebDriverCommandHandler>(new ClickElementCommandHandler);
	this->command_handlers_[ClearElement] = std::tr1::shared_ptr<WebDriverCommandHandler>(new ClearElementCommandHandler);
	this->command_handlers_[SubmitElement] = std::tr1::shared_ptr<WebDriverCommandHandler>(new SubmitElementCommandHandler);
	this->command_handlers_[ToggleElement] = std::tr1::shared_ptr<WebDriverCommandHandler>(new ToggleElementCommandHandler);
	this->command_handlers_[HoverOverElement] = std::tr1::shared_ptr<WebDriverCommandHandler>(new HoverOverElementCommandHandler);
	this->command_handlers_[DragElement] = std::tr1::shared_ptr<WebDriverCommandHandler>(new DragElementCommandHandler);
	this->command_handlers_[SetElementSelected] = std::tr1::shared_ptr<WebDriverCommandHandler>(new SetElementSelectedCommandHandler);
	this->command_handlers_[IsElementDisplayed] = std::tr1::shared_ptr<WebDriverCommandHandler>(new IsElementDisplayedCommandHandler);
	this->command_handlers_[IsElementSelected] = std::tr1::shared_ptr<WebDriverCommandHandler>(new IsElementSelectedCommandHandler);
	this->command_handlers_[IsElementEnabled] = std::tr1::shared_ptr<WebDriverCommandHandler>(new IsElementEnabledCommandHandler);
	this->command_handlers_[SendKeysToElement] = std::tr1::shared_ptr<WebDriverCommandHandler>(new SendKeysCommandHandler);
	this->command_handlers_[ElementEquals] = std::tr1::shared_ptr<WebDriverCommandHandler>(new ElementEqualsCommandHandler);
	this->command_handlers_[AddCookie] = std::tr1::shared_ptr<WebDriverCommandHandler>(new AddCookieCommandHandler);
	this->command_handlers_[GetAllCookies] = std::tr1::shared_ptr<WebDriverCommandHandler>(new GetAllCookiesCommandHandler);
	this->command_handlers_[DeleteCookie] = std::tr1::shared_ptr<WebDriverCommandHandler>(new DeleteCookieCommandHandler);
	this->command_handlers_[DeleteAllCookies] = std::tr1::shared_ptr<WebDriverCommandHandler>(new DeleteAllCookiesCommandHandler);
	this->command_handlers_[Screenshot] = std::tr1::shared_ptr<WebDriverCommandHandler>(new ScreenshotCommandHandler);

	this->command_handlers_[AcceptAlert] = std::tr1::shared_ptr<WebDriverCommandHandler>(new AcceptAlertCommandHandler);
	this->command_handlers_[DismissAlert] = std::tr1::shared_ptr<WebDriverCommandHandler>(new DismissAlertCommandHandler);
	this->command_handlers_[GetAlertText] = std::tr1::shared_ptr<WebDriverCommandHandler>(new GetAlertTextCommandHandler);
	this->command_handlers_[SendKeysToAlert] = std::tr1::shared_ptr<WebDriverCommandHandler>(new SendKeysToAlertCommandHandler);

	this->command_handlers_[SendModifierKey] = std::tr1::shared_ptr<WebDriverCommandHandler>(new SendModifierKeyCommandHandler);
	this->command_handlers_[MouseMoveTo] = std::tr1::shared_ptr<WebDriverCommandHandler>(new MouseMoveToCommandHandler);
	this->command_handlers_[MouseClick] = std::tr1::shared_ptr<WebDriverCommandHandler>(new MouseClickCommandHandler);
	this->command_handlers_[MouseDoubleClick] = std::tr1::shared_ptr<WebDriverCommandHandler>(new MouseDoubleClickCommandHandler);
	this->command_handlers_[MouseButtonDown] = std::tr1::shared_ptr<WebDriverCommandHandler>(new MouseButtonDownCommandHandler);
	this->command_handlers_[MouseButtonUp] = std::tr1::shared_ptr<WebDriverCommandHandler>(new MouseButtonUpCommandHandler);
}

} // namespace webdriver