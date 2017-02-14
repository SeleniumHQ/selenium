// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
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

#ifndef WEBDRIVER_IE_IEWEBDRIVERMANAGERCOMMANDEXECUTOR_H_
#define WEBDRIVER_IE_IEWEBDRIVERMANAGERCOMMANDEXECUTOR_H_

#include <map>
#include <string>
#include <vector>

#include "command.h"
#include "messages.h"
#include "response.h"

#include "IEWebDriverManager.h"

namespace webdriver {

class BrowserFactory;

// We use a CWindowImpl (creating a hidden window) here because we
// want to synchronize access to the command handler. For that we
// use SendMessage() most of the time, and SendMessage() requires
// a window handle.
class IEWebDriverManagerCommandExecutor : public CWindowImpl<IEWebDriverManagerCommandExecutor> {
 public:
  DECLARE_WND_CLASS(L"WebDriverWndClass")

  BEGIN_MSG_MAP(Session)
    MESSAGE_HANDLER(WM_CREATE, OnCreate)
    MESSAGE_HANDLER(WM_DESTROY, OnDestroy)
    MESSAGE_HANDLER(WD_SET_COMMAND, OnSetCommand)
    MESSAGE_HANDLER(WD_EXEC_COMMAND, OnExecCommand)
    MESSAGE_HANDLER(WD_GET_RESPONSE_LENGTH, OnGetResponseLength)
    MESSAGE_HANDLER(WD_GET_RESPONSE, OnGetResponse)
    MESSAGE_HANDLER(WD_IS_SESSION_VALID, OnIsSessionValid)
    MESSAGE_HANDLER(WD_GET_QUIT_STATUS, OnGetQuitStatus)
  END_MSG_MAP()

  LRESULT OnCreate(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnDestroy(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnSetCommand(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnExecCommand(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnGetResponseLength(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnGetResponse(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnIsSessionValid(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
  LRESULT OnGetQuitStatus(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);

  std::string session_id(void) const { return this->session_id_; }

  static unsigned int WINAPI ThreadProc(LPVOID lpParameter);
  static bool IsComponentRegistered(void);

  std::string current_browser_id(void) const { 
    return this->current_browser_id_; 
  }
  void set_current_browser_id(const std::string& browser_id) {
    this->current_browser_id_ = browser_id;
  }

  bool is_valid(void) const { return this->is_valid_; }
  void set_is_valid(const bool session_is_valid) {
    this->is_valid_ = session_is_valid; 
  }

  bool is_quitting(void) const { return this->is_quitting_; }
  void set_is_quitting(const bool session_is_quitting) {
    this->is_quitting_ = session_is_quitting; 
  }

  BrowserFactory* browser_factory(void) const { return this->factory_; }

  int port(void) const { return this->port_; }

 private:
  void DispatchCommand(void);

  std::string current_browser_id_;

  std::string session_id_;
  int port_;

  Command current_command_;
  std::string serialized_response_;
  bool is_waiting_;
  bool is_valid_;
  bool is_quitting_;

  BrowserFactory* factory_;
  CComPtr<IIEWebDriverManager> manager_;
};

} // namespace webdriver

#endif // WEBDRIVER_IE_IEWEBDRIVERMANAGERCOMMANDEXECUTOR_H_
