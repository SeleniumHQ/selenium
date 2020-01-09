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

// Defines the types of command available in the WebDriver JSON wire protocol.

#ifndef WEBDRIVER_SERVER_COMMAND_TYPES_H_
#define WEBDRIVER_SERVER_COMMAND_TYPES_H_

#include <string>

namespace webdriver {

namespace CommandType {
  const std::string NoCommand = "noCommand";
  const std::string NewSession = "newSession";
  const std::string Quit = "quit";
  const std::string GetTimeouts = "getTimeouts";
  const std::string SetTimeouts = "setTimeouts";
  const std::string Status = "status";
  const std::string Get = "get";
  const std::string GetCurrentUrl = "getCurrentUrl";
  const std::string GoBack = "goBack";
  const std::string GoForward = "goForward";
  const std::string Refresh = "refresh";
  const std::string GetTitle = "getTitle";
  const std::string GetCurrentWindowHandle = "getWindowHandle";
  const std::string CloseWindow = "closeWindow";
  const std::string SwitchToWindow = "switchToWindow";
  const std::string GetWindowHandles = "getWindowHandles";
  const std::string NewWindow = "newWindow";
  const std::string SwitchToFrame = "switchToFrame";
  const std::string SwitchToParentFrame = "switchToParentFrame";
  const std::string GetWindowRect = "getWindowRect";
  const std::string SetWindowRect = "setWindowRect";
  const std::string MaximizeWindow = "maximizeWindow";
  const std::string MinimizeWindow = "minimizeWindow";
  const std::string FullscreenWindow = "fullscreenWindow";
  const std::string GetActiveElement = "getActiveElement";
  const std::string FindElement = "findElement";
  const std::string FindElements = "findElements";
  const std::string FindChildElement = "findChildElement";
  const std::string FindChildElements = "findChildElements";
  const std::string IsElementSelected = "isSelected";
  const std::string GetElementAttribute = "getElementAttribute";
  const std::string GetElementProperty = "getElementProperty";
  const std::string GetElementValueOfCssProperty = "getValueOfCssProperty";
  const std::string GetElementText = "getElementText";
  const std::string GetElementTagName = "getElementTagName";
  const std::string GetElementRect = "getElementRect";
  const std::string IsElementEnabled = "isEnabled";
  const std::string ClickElement = "click";
  const std::string ClearElement = "clear";
  const std::string SendKeysToElement = "sendKeys";
  const std::string GetPageSource = "getPageSource";
  const std::string ExecuteScript = "executeScript";
  const std::string ExecuteAsyncScript = "executeAsyncScript";
  const std::string GetAllCookies = "getAllCookies";
  const std::string GetNamedCookie = "getNamedCookie";
  const std::string AddCookie = "addCookie";
  const std::string DeleteNamedCookie = "deleteNamedCookie";
  const std::string DeleteAllCookies = "deleteAllCookies";
  const std::string Actions = "performActions";
  const std::string ReleaseActions = "releaseActions";
  const std::string DismissAlert = "dismiss";
  const std::string AcceptAlert = "accept";
  const std::string GetAlertText = "getAlertText";
  const std::string SendKeysToAlert = "sendKeysToAlert";
  const std::string Screenshot = "takeScreenshot";
  const std::string ElementScreenshot = "takeElementScreenshot";

  // Additional commands required to be supported, but not defined
  // in the specification.
  const std::string SetAlertCredentials = "setAlertCredentials";
  const std::string IsElementDisplayed = "isDisplayed";
  const std::string ElementEquals = "elementEquals";
  const std::string GetSessionList = "getSessionList";
  const std::string GetSessionCapabilities = "getSessionCapabilities";

  const std::string ListAvailableImeEngines = "listAvailableImeEngines";
  const std::string GetActiveImeEngine = "getActiveImeEngine";
  const std::string IsImeActivated = "isImeActivated";
  const std::string ActivateImeEngine = "activateImeEngine";
  const std::string DeactivateImeEngine = "deactivateImeEngine";
}

}  // namespace webdriver

#endif  // WEBDRIVER_SERVER_COMMAND_TYPES_H_
