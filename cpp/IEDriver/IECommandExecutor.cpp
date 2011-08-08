// Copyright 2011 Software Freedom Conservatory
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

#include "IECommandExecutor.h"
#include "CommandHandlers/AcceptAlertCommandHandler.h"
#include "CommandHandlers/AddCookieCommandHandler.h"
#include "CommandHandlers/ClickElementCommandHandler.h"
#include "CommandHandlers/ClearElementCommandHandler.h"
#include "CommandHandlers/CloseWindowCommandHandler.h"
#include "CommandHandlers/DeleteAllCookiesCommandHandler.h"
#include "CommandHandlers/DeleteCookieCommandHandler.h"
#include "CommandHandlers/DismissAlertCommandHandler.h"
#include "CommandHandlers/ElementEqualsCommandHandler.h"
#include "CommandHandlers/ExecuteAsyncScriptCommandHandler.h"
#include "CommandHandlers/ExecuteScriptCommandHandler.h"
#include "CommandHandlers/FindChildElementCommandHandler.h"
#include "CommandHandlers/FindChildElementsCommandHandler.h"
#include "CommandHandlers/FindElementCommandHandler.h"
#include "CommandHandlers/FindElementsCommandHandler.h"
#include "CommandHandlers/GetActiveElementCommandHandler.h"
#include "CommandHandlers/GetAlertTextCommandHandler.h"
#include "CommandHandlers/GetAllCookiesCommandHandler.h"
#include "CommandHandlers/GetAllWindowHandlesCommandHandler.h"
#include "CommandHandlers/GetCurrentUrlCommandHandler.h"
#include "CommandHandlers/GetCurrentWindowHandleCommandHandler.h"
#include "CommandHandlers/GetElementAttributeCommandHandler.h"
#include "CommandHandlers/GetElementLocationCommandHandler.h"
#include "CommandHandlers/GetElementLocationOnceScrolledIntoViewCommandHandler.h"
#include "CommandHandlers/GetElementSizeCommandHandler.h"
#include "CommandHandlers/GetElementTagNameCommandHandler.h"
#include "CommandHandlers/GetElementTextCommandHandler.h"
#include "CommandHandlers/GetElementValueOfCssPropertyCommandHandler.h"
#include "CommandHandlers/GetSessionCapabilitiesCommandHandler.h"
#include "CommandHandlers/GetPageSourceCommandHandler.h"
#include "CommandHandlers/GetTitleCommandHandler.h"
#include "CommandHandlers/GoBackCommandHandler.h"
#include "CommandHandlers/GoForwardCommandHandler.h"
#include "CommandHandlers/GoToUrlCommandHandler.h"
#include "CommandHandlers/IsElementDisplayedCommandHandler.h"
#include "CommandHandlers/IsElementEnabledCommandHandler.h"
#include "CommandHandlers/IsElementSelectedCommandHandler.h"
#include "CommandHandlers/MouseMoveToCommandHandler.h"
#include "CommandHandlers/MouseClickCommandHandler.h"
#include "CommandHandlers/MouseDoubleClickCommandHandler.h"
#include "CommandHandlers/MouseButtonDownCommandHandler.h"
#include "CommandHandlers/MouseButtonUpCommandHandler.h"
#include "CommandHandlers/NewSessionCommandHandler.h"
#include "CommandHandlers/QuitCommandHandler.h"
#include "CommandHandlers/RefreshCommandHandler.h"
#include "CommandHandlers/ScreenshotCommandHandler.h"
#include "CommandHandlers/SendKeysCommandHandler.h"
#include "CommandHandlers/SendKeysToAlertCommandHandler.h"
#include "CommandHandlers/SendModifierKeyCommandHandler.h"
#include "CommandHandlers/SetAsyncScriptTimeoutCommandHandler.h"
#include "CommandHandlers/SetImplicitWaitTimeoutCommandHandler.h"
#include "CommandHandlers/SubmitElementCommandHandler.h"
#include "CommandHandlers/SwitchToFrameCommandHandler.h"
#include "CommandHandlers/SwitchToWindowCommandHandler.h"

namespace webdriver {

LRESULT IECommandExecutor::OnInit(UINT uMsg,
                                  WPARAM wParam,
                                  LPARAM lParam,
                                  BOOL& bHandled) {
  // If we wanted to be a little more clever, we could create a struct 
  // containing the HWND and the port number and pass them into the
  // ThreadProc via lpParameter and avoid this message handler altogether.
  this->port_ = (int)wParam;
  return 0;
}

LRESULT IECommandExecutor::OnCreate(UINT uMsg,
                                    WPARAM wParam,
                                    LPARAM lParam,
                                    BOOL& bHandled) {
  // NOTE: COM should be initialized on this thread, so we
  // could use CoCreateGuid() and StringFromGUID2() instead.
  UUID guid;
  RPC_WSTR guid_string = NULL;
  RPC_STATUS status = ::UuidCreate(&guid);
  status = ::UuidToString(&guid, &guid_string);

  // RPC_WSTR is currently typedef'd in RpcDce.h (pulled in by rpc.h)
  // as unsigned short*. It needs to be typedef'd as wchar_t* 
  wchar_t* cast_guid_string = reinterpret_cast<wchar_t*>(guid_string);
  this->SetWindowText(cast_guid_string);

  std::string session_id = CW2A(cast_guid_string, CP_UTF8);
  this->session_id_ = session_id;
  this->is_valid_ = true;

  ::RpcStringFree(&guid_string);

  this->PopulateCommandHandlers();
  this->PopulateElementFinderMethods();
  this->current_browser_id_ = "";
  this->serialized_response_ = "";
  this->ignore_protected_mode_settings_ = false;
  this->speed_ = 0;
  this->implicit_wait_timeout_ = 0;
  this->last_known_mouse_x_ = 0;
  this->last_known_mouse_y_ = 0;
  return 0;
}

LRESULT IECommandExecutor::OnClose(UINT uMsg,
                                   WPARAM wParam,
                                   LPARAM lParam,
                                   BOOL& bHandled) {
  this->DestroyWindow();
  return 0;
}

LRESULT IECommandExecutor::OnDestroy(UINT uMsg,
                                     WPARAM wParam,
                                     LPARAM lParam,
                                     BOOL& bHandled) {
  ::PostQuitMessage(0);
  return 0;
}

LRESULT IECommandExecutor::OnSetCommand(UINT uMsg,
                                        WPARAM wParam,
                                        LPARAM lParam,
                                        BOOL& bHandled) {
  LPCSTR json_command = reinterpret_cast<LPCSTR>(lParam);
  this->current_command_.Populate(json_command);
  return 0;
}

LRESULT IECommandExecutor::OnExecCommand(UINT uMsg,
                                         WPARAM wParam,
                                         LPARAM lParam,
                                         BOOL& bHandled) {
  this->DispatchCommand();
  return 0;
}

LRESULT IECommandExecutor::OnGetResponseLength(UINT uMsg,
                                               WPARAM wParam,
                                               LPARAM lParam,
                                               BOOL& bHandled) {
  size_t response_length = 0;
  if (!this->is_waiting_) {
    response_length = this->serialized_response_.size();
  }
  return response_length;
}

LRESULT IECommandExecutor::OnGetResponse(UINT uMsg,
                                         WPARAM wParam,
                                         LPARAM lParam,
                                         BOOL& bHandled) {
  LPSTR str = reinterpret_cast<LPSTR>(lParam);
  strcpy_s(str,
           this->serialized_response_.size() + 1,
           this->serialized_response_.c_str());

  // Reset the serialized response for the next command.
  this->serialized_response_ = "";
  return 0;
}

LRESULT IECommandExecutor::OnWait(UINT uMsg,
                                  WPARAM wParam,
                                  LPARAM lParam,
                                  BOOL& bHandled) {
  BrowserHandle browser;
  int status_code = this->GetCurrentBrowser(&browser);
  if (status_code == SUCCESS && !browser->is_closing()) {
    this->is_waiting_ = !(browser->Wait());
    if (this->is_waiting_) {
      // If we are still waiting, we need to wait a bit then post a message to
      // ourselves to run the wait again. However, we can't wait using Sleep()
      // on this thread. This call happens in a message loop, and we would be 
      // unable to process the COM events in the browser if we put this thread
      // to sleep.
      unsigned int thread_id = 0;
      HANDLE thread_handle = reinterpret_cast<HANDLE>(_beginthreadex(NULL,
                                                      0,
                                                      &IECommandExecutor::WaitThreadProc,
                                                      (void *)this->m_hWnd,
                                                      0,
                                                      &thread_id));
      if (thread_handle != NULL) {
        ::CloseHandle(thread_handle);
      }
    }
  } else {
    this->is_waiting_ = false;
  }
  return 0;
}

LRESULT IECommandExecutor::OnBrowserNewWindow(UINT uMsg,
                                              WPARAM wParam,
                                              LPARAM lParam,
                                              BOOL& bHandled) {
  IWebBrowser2* browser = this->factory_.CreateBrowser();
  BrowserHandle new_window_wrapper(new Browser(browser, NULL, this->m_hWnd));
  this->AddManagedBrowser(new_window_wrapper);
  LPSTREAM* stream = reinterpret_cast<LPSTREAM*>(lParam);
  HRESULT hr = ::CoMarshalInterThreadInterfaceInStream(IID_IWebBrowser2,
                                                       browser,
                                                       stream);
  return 0;
}

LRESULT IECommandExecutor::OnBrowserQuit(UINT uMsg,
                                         WPARAM wParam,
                                         LPARAM lParam,
                                         BOOL& bHandled) {
  LPCSTR str = reinterpret_cast<LPCSTR>(lParam);
  std::string browser_id(str);
  delete[] str;
  BrowserMap::iterator found_iterator = this->managed_browsers_.find(browser_id);
  if (found_iterator != this->managed_browsers_.end()) {
    this->managed_browsers_.erase(browser_id);
    if (this->managed_browsers_.size() == 0) {
      this->current_browser_id_ = "";
    }
  }
  return 0;
}

LRESULT IECommandExecutor::OnIsSessionValid(UINT uMsg,
                                            WPARAM wParam,
                                            LPARAM lParam,
                                            BOOL& bHandled) {
  return this->is_valid_ ? 1 : 0;
}

LRESULT IECommandExecutor::OnNewHtmlDialog(UINT uMsg,
                                           WPARAM wParam,
                                           LPARAM lParam,
                                           BOOL& bHandles) {
  HWND dialog_handle = reinterpret_cast<HWND>(lParam);
  CComPtr<IHTMLDocument2> document;
  if (this->factory_.GetDocumentFromWindowHandle(dialog_handle, &document)) {
    IHTMLWindow2* window;
    document->get_parentWindow(&window);
    this->AddManagedBrowser(BrowserHandle(new HtmlDialog(window,
                                                         dialog_handle,
                                                         this->m_hWnd)));
  }
  return 0;
}

unsigned int WINAPI IECommandExecutor::WaitThreadProc(LPVOID lpParameter) {
  HWND window_handle = reinterpret_cast<HWND>(lpParameter);
  ::Sleep(WAIT_TIME_IN_MILLISECONDS);
  ::PostMessage(window_handle, WD_WAIT, NULL, NULL);
  return 0;
}


unsigned int WINAPI IECommandExecutor::ThreadProc(LPVOID lpParameter) {
  // Optional TODO: Create a struct to pass in via lpParameter
  // instead of just a pointer to an HWND. That way, we could
  // pass the mongoose server port via a single call, rather than
  // having to send an init message after the window is created.
  HWND *window_handle = reinterpret_cast<HWND*>(lpParameter);
  DWORD error = 0;
  HRESULT hr = ::CoInitializeEx(NULL, COINIT_APARTMENTTHREADED);
  IECommandExecutor new_session;
  HWND session_window_handle = new_session.Create(HWND_MESSAGE,
                                                  CWindow::rcDefault);
  if (session_window_handle == NULL) {
    error = ::GetLastError();
  }

  // Return the HWND back through lpParameter, and signal that the
  // window is ready for messages.
  *window_handle = session_window_handle;
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

void IECommandExecutor::DispatchCommand() {
  Response response(this->session_id_);
  CommandHandlerMap::const_iterator found_iterator = 
      this->command_handlers_.find(this->current_command_.command_type());

  if (found_iterator == this->command_handlers_.end()) {
    response.SetErrorResponse(501, "Command not implemented");
  } else {
    CommandHandlerHandle command_handler = found_iterator->second;
    command_handler->Execute(*this, this->current_command_, &response);

    BrowserHandle browser;
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

int IECommandExecutor::GetCurrentBrowser(BrowserHandle* browser_wrapper) const {
  return this->GetManagedBrowser(this->current_browser_id_, browser_wrapper);
}

int IECommandExecutor::GetManagedBrowser(const std::string& browser_id,
                                         BrowserHandle* browser_wrapper) const {
  if (browser_id == "") {
    return ENOSUCHDRIVER;
  }

  BrowserMap::const_iterator found_iterator = 
      this->managed_browsers_.find(browser_id);
  if (found_iterator == this->managed_browsers_.end()) {
    return ENOSUCHDRIVER;
  }

  *browser_wrapper = found_iterator->second;
  return SUCCESS;
}

void IECommandExecutor::GetManagedBrowserHandles(std::vector<std::string>* managed_browser_handles) const {
  // TODO: Enumerate windows looking for browser windows
  // created by showModalDialog().
  BrowserMap::const_iterator it = this->managed_browsers_.begin();
  for (; it != this->managed_browsers_.end(); ++it) {
    managed_browser_handles->push_back(it->first);
  }
}

void IECommandExecutor::AddManagedBrowser(BrowserHandle browser_wrapper) {
  this->managed_browsers_[browser_wrapper->browser_id()] = browser_wrapper;
  if (this->current_browser_id_ == "") {
    this->current_browser_id_ = browser_wrapper->browser_id();
  }
}

int IECommandExecutor::CreateNewBrowser(void) {
  DWORD dwProcId = this->factory_.LaunchBrowserProcess(this->port_,
                                                       this->ignore_protected_mode_settings_);
  if (dwProcId == NULL) {
    this->is_waiting_ = false;
    return ENOSUCHDRIVER;
  }
  ProcessWindowInfo process_window_info;
  process_window_info.dwProcessId = dwProcId;
  process_window_info.hwndBrowser = NULL;
  process_window_info.pBrowser = NULL;
  this->factory_.AttachToBrowser(&process_window_info);
  BrowserHandle wrapper(new Browser(process_window_info.pBrowser,
                                    process_window_info.hwndBrowser,
                                    this->m_hWnd));
  this->AddManagedBrowser(wrapper);
  return SUCCESS;
}

int IECommandExecutor::GetManagedElement(const std::string& element_id,
                                         ElementHandle* element_wrapper) const {
  ElementMap::const_iterator found_iterator = this->managed_elements_.find(element_id);
  if (found_iterator == this->managed_elements_.end()) {
    return ENOSUCHELEMENT;
  }

  *element_wrapper = found_iterator->second;
  return SUCCESS;
}

void IECommandExecutor::AddManagedElement(IHTMLElement* element,
                                          ElementHandle* element_wrapper) {
  // TODO: This method needs much work. If we are already managing a
  // given element, we don't want to assign it a new ID, but to find
  // out if we're managing it already, we need to compare to all of 
  // the elements already in our map, which means iterating through
  // the map. For long-running tests, this means the addition of a
  // new managed element may take longer and longer as we have no
  // good algorithm for removing dead elements from the map.
  bool element_already_managed = false;
  ElementMap::iterator it = this->managed_elements_.begin();
  for (; it != this->managed_elements_.end(); ++it) {
    if (it->second->element() == element) {
      *element_wrapper = it->second;
      element_already_managed = true;
      break;
    }
  }

  if (!element_already_managed) {
    BrowserHandle current_browser;
    this->GetCurrentBrowser(&current_browser);
    ElementHandle new_wrapper(new Element(element,
                                          current_browser->GetWindowHandle()));
    this->managed_elements_[new_wrapper->element_id()] = new_wrapper;
    *element_wrapper = new_wrapper;
  }
}

void IECommandExecutor::RemoveManagedElement(const std::string& element_id) {
  ElementMap::iterator found_iterator = this->managed_elements_.find(element_id);
  if (found_iterator != this->managed_elements_.end()) {
    this->managed_elements_.erase(element_id);
  }
}

void IECommandExecutor::ListManagedElements() {
  ElementMap::iterator it = this->managed_elements_.begin();
  for (; it != this->managed_elements_.end(); ++it) {
    std::cout << it->first << "\n";
  }
}

int IECommandExecutor::GetElementFindMethod(const std::string& mechanism,
                                            std::wstring* translation) const {
  ElementFindMethodMap::const_iterator found_iterator =
      this->element_find_methods_.find(mechanism);
  if (found_iterator == this->element_find_methods_.end()) {
    return EUNHANDLEDERROR;
  }

  *translation = found_iterator->second;
  return SUCCESS;
}

int IECommandExecutor::LocateElement(const ElementHandle parent_wrapper,
                                     const std::string& mechanism,
                                     const std::string& criteria,
                                     Json::Value* found_element) const {
  std::wstring mechanism_translation = L"";
  int status_code = this->GetElementFindMethod(mechanism,
                                               &mechanism_translation);
  if (status_code != SUCCESS) {
    return status_code;
  }
  std::wstring wide_criteria = CA2W(criteria.c_str(), CP_UTF8);
  return this->element_finder().FindElement(*this,
                                            parent_wrapper,
                                            mechanism_translation,
                                            wide_criteria,
                                            found_element);
}

int IECommandExecutor::LocateElements(const ElementHandle parent_wrapper,
                                      const std::string& mechanism,
                                      const std::string& criteria,
                                      Json::Value* found_elements) const {
  std::wstring mechanism_translation = L"";
  int status_code = this->GetElementFindMethod(mechanism,
                                               &mechanism_translation);
  if (status_code != SUCCESS) {
    return status_code;
  }
  std::wstring wide_criteria = CA2W(criteria.c_str(), CP_UTF8);
  return this->element_finder().FindElements(*this,
                                             parent_wrapper,
                                             mechanism_translation,
                                             wide_criteria,
                                             found_elements);
}

void IECommandExecutor::PopulateElementFinderMethods(void) {
  this->element_find_methods_["id"] = L"id";
  this->element_find_methods_["name"] = L"name";
  this->element_find_methods_["tag name"] = L"tagName";
  this->element_find_methods_["link text"] = L"linkText";
  this->element_find_methods_["partial link text"] = L"partialLinkText";
  this->element_find_methods_["class name"] = L"className";
  this->element_find_methods_["xpath"] = L"xpath";
  this->element_find_methods_["css selector"] = L"css";
}

void IECommandExecutor::PopulateCommandHandlers() {
  this->command_handlers_[NoCommand] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[GetCurrentWindowHandle] = CommandHandlerHandle(new GetCurrentWindowHandleCommandHandler);
  this->command_handlers_[GetWindowHandles] = CommandHandlerHandle(new GetAllWindowHandlesCommandHandler);
  this->command_handlers_[SwitchToWindow] = CommandHandlerHandle(new SwitchToWindowCommandHandler);
  this->command_handlers_[SwitchToFrame] = CommandHandlerHandle(new SwitchToFrameCommandHandler);
  this->command_handlers_[Get] = CommandHandlerHandle(new GoToUrlCommandHandler);
  this->command_handlers_[GoForward] = CommandHandlerHandle(new GoForwardCommandHandler);
  this->command_handlers_[GoBack] = CommandHandlerHandle(new GoBackCommandHandler);
  this->command_handlers_[Refresh] = CommandHandlerHandle(new RefreshCommandHandler);
  this->command_handlers_[ImplicitlyWait] = CommandHandlerHandle(new SetImplicitWaitTimeoutCommandHandler);
  this->command_handlers_[SetAsyncScriptTimeout] = CommandHandlerHandle(new SetAsyncScriptTimeoutCommandHandler);
  this->command_handlers_[NewSession] = CommandHandlerHandle(new NewSessionCommandHandler);
  this->command_handlers_[GetSessionCapabilities] = CommandHandlerHandle(new GetSessionCapabilitiesCommandHandler);
  this->command_handlers_[Close] = CommandHandlerHandle(new CloseWindowCommandHandler);
  this->command_handlers_[Quit] = CommandHandlerHandle(new QuitCommandHandler);
  this->command_handlers_[GetTitle] = CommandHandlerHandle(new GetTitleCommandHandler);
  this->command_handlers_[GetPageSource] = CommandHandlerHandle(new GetPageSourceCommandHandler);
  this->command_handlers_[GetCurrentUrl] = CommandHandlerHandle(new GetCurrentUrlCommandHandler);
  this->command_handlers_[ExecuteAsyncScript] = CommandHandlerHandle(new ExecuteAsyncScriptCommandHandler);
  this->command_handlers_[ExecuteScript] = CommandHandlerHandle(new ExecuteScriptCommandHandler);
  this->command_handlers_[GetActiveElement] = CommandHandlerHandle(new GetActiveElementCommandHandler);
  this->command_handlers_[FindElement] = CommandHandlerHandle(new FindElementCommandHandler);
  this->command_handlers_[FindElements] = CommandHandlerHandle(new FindElementsCommandHandler);
  this->command_handlers_[FindChildElement] = CommandHandlerHandle(new FindChildElementCommandHandler);
  this->command_handlers_[FindChildElements] = CommandHandlerHandle(new FindChildElementsCommandHandler);
  this->command_handlers_[GetElementTagName] = CommandHandlerHandle(new GetElementTagNameCommandHandler);
  this->command_handlers_[GetElementLocation] = CommandHandlerHandle(new GetElementLocationCommandHandler);
  this->command_handlers_[GetElementSize] = CommandHandlerHandle(new GetElementSizeCommandHandler);
  this->command_handlers_[GetElementLocationOnceScrolledIntoView] = CommandHandlerHandle(new GetElementLocationOnceScrolledIntoViewCommandHandler);
  this->command_handlers_[GetElementAttribute] = CommandHandlerHandle(new GetElementAttributeCommandHandler);
  this->command_handlers_[GetElementText] = CommandHandlerHandle(new GetElementTextCommandHandler);
  this->command_handlers_[GetElementValueOfCssProperty] = CommandHandlerHandle(new GetElementValueOfCssPropertyCommandHandler);
  this->command_handlers_[ClickElement] = CommandHandlerHandle(new ClickElementCommandHandler);
  this->command_handlers_[ClearElement] = CommandHandlerHandle(new ClearElementCommandHandler);
  this->command_handlers_[SubmitElement] = CommandHandlerHandle(new SubmitElementCommandHandler);
  this->command_handlers_[IsElementDisplayed] = CommandHandlerHandle(new IsElementDisplayedCommandHandler);
  this->command_handlers_[IsElementSelected] = CommandHandlerHandle(new IsElementSelectedCommandHandler);
  this->command_handlers_[IsElementEnabled] = CommandHandlerHandle(new IsElementEnabledCommandHandler);
  this->command_handlers_[SendKeysToElement] = CommandHandlerHandle(new SendKeysCommandHandler);
  this->command_handlers_[ElementEquals] = CommandHandlerHandle(new ElementEqualsCommandHandler);
  this->command_handlers_[AddCookie] = CommandHandlerHandle(new AddCookieCommandHandler);
  this->command_handlers_[GetAllCookies] = CommandHandlerHandle(new GetAllCookiesCommandHandler);
  this->command_handlers_[DeleteCookie] = CommandHandlerHandle(new DeleteCookieCommandHandler);
  this->command_handlers_[DeleteAllCookies] = CommandHandlerHandle(new DeleteAllCookiesCommandHandler);
  this->command_handlers_[Screenshot] = CommandHandlerHandle(new ScreenshotCommandHandler);

  this->command_handlers_[AcceptAlert] = CommandHandlerHandle(new AcceptAlertCommandHandler);
  this->command_handlers_[DismissAlert] = CommandHandlerHandle(new DismissAlertCommandHandler);
  this->command_handlers_[GetAlertText] = CommandHandlerHandle(new GetAlertTextCommandHandler);
  this->command_handlers_[SendKeysToAlert] = CommandHandlerHandle(new SendKeysToAlertCommandHandler);

  this->command_handlers_[SendModifierKey] = CommandHandlerHandle(new SendModifierKeyCommandHandler);
  this->command_handlers_[MouseMoveTo] = CommandHandlerHandle(new MouseMoveToCommandHandler);
  this->command_handlers_[MouseClick] = CommandHandlerHandle(new MouseClickCommandHandler);
  this->command_handlers_[MouseDoubleClick] = CommandHandlerHandle(new MouseDoubleClickCommandHandler);
  this->command_handlers_[MouseButtonDown] = CommandHandlerHandle(new MouseButtonDownCommandHandler);
  this->command_handlers_[MouseButtonUp] = CommandHandlerHandle(new MouseButtonUpCommandHandler);

  // As-yet unimplemented commands
  this->command_handlers_[Status] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[GetOrientation] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[SetOrientation] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[ListAvailableImeEngines] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[GetActiveImeEngine] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[IsImeActivated] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[ActivateImeEngine] = CommandHandlerHandle(new IECommandHandler);
  this->command_handlers_[DeactivateImeEngine] = CommandHandlerHandle(new IECommandHandler);
}

} // namespace webdriver
