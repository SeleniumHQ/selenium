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

#ifndef WEBDRIVER_WEBDRIVERCONSTANTS_H_
#define WEBDRIVER_WEBDRIVERCONSTANTS_H_

// User prompt handling constants
#define IGNORE_UNEXPECTED_ALERTS "ignore"
#define ACCEPT_UNEXPECTED_ALERTS "accept"
#define DISMISS_UNEXPECTED_ALERTS "dismiss"
#define ACCEPT_AND_NOTIFY_UNEXPECTED_ALERTS "accept and notify"
#define DISMISS_AND_NOTIFY_UNEXPECTED_ALERTS "dismiss and notify"

// Page load strategy constants
#define NORMAL_PAGE_LOAD_STRATEGY "normal"
#define EAGER_PAGE_LOAD_STRATEGY "eager"
#define NONE_PAGE_LOAD_STRATEGY "none"

// Timeout name constants
#define IMPLICIT_WAIT_TIMEOUT_NAME "implicit"
#define SCRIPT_TIMEOUT_NAME "script"
#define PAGE_LOAD_TIMEOUT_NAME "pageLoad"

// Standard capability names
#define BROWSER_NAME_CAPABILITY "browserName"
#define BROWSER_VERSION_CAPABILITY "browserVersion"
#define PLATFORM_NAME_CAPABILITY "platformName"
#define ACCEPT_INSECURE_CERTS_CAPABILITY "acceptInsecureCerts"
#define PAGE_LOAD_STRATEGY_CAPABILITY "pageLoadStrategy"
#define PROXY_CAPABILITY "proxy"
#define SET_WINDOW_RECT_CAPABILITY "setWindowRect"
#define TIMEOUTS_CAPABILITY "timeouts"
#define UNHANDLED_PROMPT_BEHAVIOR_CAPABILITY "unhandledPromptBehavior"
#define STRICT_FILE_INTERACTABILITY_CAPABILITY "strictFileInteractability"
#define IE_DRIVER_EXTENSIONS_CAPABILITY "se:ieOptions"

// Custom capability names
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

// New top-level browsing context types
#define WINDOW_WINDOW_TYPE "window"
#define TAB_WINDOW_TYPE "tab"

// Window classes
#define ALERT_WINDOW_CLASS "#32770"
#define HTML_DIALOG_WINDOW_CLASS "Internet Explorer_TridentDlgFrame"
#define SECURITY_DIALOG_WINDOW_CLASS "Credential Dialog Xaml Host"

// Event names
#define WEBDRIVER_START_EVENT_NAME L"WD_START_EVENT"
#define ASYNC_SCRIPT_EVENT_NAME L"WD_ASYNC_SCRIPT_START_EVENT"

// Numeric constants
#define MAX_SAFE_INTEGER 9007199254740991L
#define SCRIPT_WAIT_TIME_IN_MILLISECONDS 10
#define FIND_ELEMENT_WAIT_TIME_IN_MILLISECONDS 250
#define ASYNC_SCRIPT_EXECUTION_TIMEOUT_IN_MILLISECONDS 2000

// Custom error status codes
#define EELEMENTCLICKPOINTNOTSCROLLED 100

#endif // WEBDRIVER_WEBDRIVERCONSTANTS_H_
