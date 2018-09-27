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

#ifndef WEBDRIVER_IE_COMMANDHANDLER_H_
#define WEBDRIVER_IE_COMMANDHANDLER_H_

#include <map>
#include <string>

#include "command_handler.h"
#include "command.h"
#include "response.h"

#include "CustomTypes.h"

#define BROWSER_NAME_CAPABILITY "browserName"
#define BROWSER_VERSION_CAPABILITY "browserVersion"
#define PLATFORM_NAME_CAPABILITY "platformName"
#define ACCEPT_INSECURE_CERTS_CAPABILITY "acceptInsecureCerts"
#define PAGE_LOAD_STRATEGY_CAPABILITY "pageLoadStrategy"
#define PROXY_CAPABILITY "proxy"
#define SET_WINDOW_RECT_CAPABILITY "setWindowRect"
#define TIMEOUTS_CAPABILITY "timeouts"
#define UNHANDLED_PROMPT_BEHAVIOR_CAPABILITY "unhandledPromptBehavior"
#define IE_DRIVER_EXTENSIONS_CAPABILITY "se:ieOptions"

#define NATIVE_EVENTS_CAPABILITY "nativeEvents"
#define IGNORE_PROTECTED_MODE_CAPABILITY "ignoreProtectedModeSettings"
#define IGNORE_ZOOM_SETTING_CAPABILITY "ignoreZoomSetting"
#define INITIAL_BROWSER_URL_CAPABILITY "initialBrowserUrl"
#define ELEMENT_SCROLL_BEHAVIOR_CAPABILITY "elementScrollBehavior"
#define ENABLE_PERSISTENT_HOVER_CAPABILITY "enablePersistentHover"
#define REQUIRE_WINDOW_FOCUS_CAPABILITY "requireWindowFocus"
#define BROWSER_ATTACH_TIMEOUT_CAPABILITY "browserAttachTimeout"
#define BROWSER_COMMAND_LINE_SWITCHES_CAPABILITY "ie.browserCommandLineSwitches"
#define FORCE_CREATE_PROCESS_API_CAPABILITY "ie.forceCreateProcessApi"
#define USE_PER_PROCESS_PROXY_CAPABILITY "ie.usePerProcessProxy"
#define ENSURE_CLEAN_SESSION_CAPABILITY "ie.ensureCleanSession"
#define FORCE_SHELL_WINDOWS_API_CAPABILITY "ie.forceShellWindowsApi"
#define FILE_UPLOAD_DIALOG_TIMEOUT_CAPABILITY "ie.fileUploadDialogTimeout"
#define USE_LEGACY_FILE_UPLOAD_DIALOG_HANDLING_CAPABILITY "ie.useLegacyFileUploadDialogHandling"
#define ENABLE_FULL_PAGE_SCREENSHOT_CAPABILITY "ie.enableFullPageScreenshot"
#define IE_DRIVER_EXTENSIONS_CAPABILITY "se:ieOptions"

namespace webdriver {

// Forward declaration of classes to avoid
// circular include files.
class IECommandExecutor;

class IECommandHandler : public CommandHandler<IECommandExecutor> {
 public:
  IECommandHandler(void);
  virtual ~IECommandHandler(void);

 protected:
  virtual void ExecuteInternal(const IECommandExecutor& executor,
                               const ParametersMap& command_parameters,
                               Response* response);
  int GetElement(const IECommandExecutor& executor,
                 const std::string& element_id,
                 ElementHandle* element_wrapper);
  Json::Value RecreateJsonParameterObject(const ParametersMap& command_parameters);
};

} // namespace webdriver

#endif // WEBDRIVER_IE_COMMANDHANDLER_H_
