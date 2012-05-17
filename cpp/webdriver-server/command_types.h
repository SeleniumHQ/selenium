// Copyright 2011 Software Freedom Conservancy
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

// Defines the types of command available in the WebDriver JSON wire protocol.

#ifndef WEBDRIVER_SERVER_COMMAND_TYPES_H_
#define WEBDRIVER_SERVER_COMMAND_TYPES_H_

namespace webdriver {

enum CommandType {
  NoCommand,
  Status,
  GetSessionList,
  NewSession,
  GetSessionCapabilities,
  Close,
  Quit,
  Get,
  GoBack,
  GoForward,
  Refresh,
  AddCookie,
  GetAllCookies,
  DeleteCookie,
  DeleteAllCookies,
  FindElement,
  FindElements,
  FindChildElement,
  FindChildElements,
  DescribeElement,
  ClearElement,
  ClickElement,
  SendKeysToElement,
  SubmitElement,
  GetCurrentWindowHandle,
  GetWindowHandles,
  SwitchToWindow,
  SwitchToFrame,
  GetActiveElement,
  GetCurrentUrl,
  GetPageSource,
  GetTitle,
  ExecuteScript,
  ExecuteAsyncScript,
  GetElementText,
  GetElementValue,
  GetElementTagName,
  IsElementSelected,
  IsElementEnabled,
  IsElementDisplayed,
  GetElementLocation,
  GetElementLocationOnceScrolledIntoView,
  GetElementSize,
  GetElementAttribute,
  GetElementValueOfCssProperty,
  ElementEquals,
  Screenshot, 
  ImplicitlyWait,
  SetAsyncScriptTimeout,
  SetTimeout,
  GetOrientation,
  SetOrientation,

  GetWindowSize,
  SetWindowSize,
  GetWindowPosition,
  SetWindowPosition,
  MaximizeWindow,

  AcceptAlert,
  DismissAlert,
  GetAlertText,
  SendKeysToAlert,

  SendKeysToActiveElement,
  MouseMoveTo,
  MouseClick,
  MouseDoubleClick,
  MouseButtonDown,
  MouseButtonUp,

  ListAvailableImeEngines,
  GetActiveImeEngine,
  IsImeActivated,
  ActivateImeEngine,
  DeactivateImeEngine,

  TouchClick,
  TouchDown,
  TouchUp,
  TouchMove,
  TouchScroll,
  TouchDoubleClick,
  TouchLongClick,
  TouchFlick
};

}  // namespace webdriver

#endif  // WEBDRIVER_SERVER_COMMAND_TYPES_H_
