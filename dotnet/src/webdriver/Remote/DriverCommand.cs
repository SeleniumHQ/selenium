// <copyright file="DriverCommand.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License = string.Empty; Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing = string.Empty; software
// distributed under the License is distributed on an "AS IS" BASIS = string.Empty;
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND = string.Empty; either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Values describing the list of commands understood by a remote server using the JSON wire protocol.
    /// </summary>
    public static class DriverCommand
    {
        /// <summary>
        /// Represents the Define Driver Mapping command
        /// </summary>
        public static readonly string DefineDriverMapping = "defineDriverMapping";

        /// <summary>
        /// Represents the Status command.
        /// </summary>
        public static readonly string Status = "status";

        /// <summary>
        /// Represents a New Session command
        /// </summary>
        public static readonly string NewSession = "newSession";

        /// <summary>
        /// Represents the Get Session List command
        /// </summary>
        public static readonly string GetSessionList = "getSessionList";

        /// <summary>
        /// Represents the Get Session Capabilities command
        /// </summary>
        public static readonly string GetSessionCapabilities = "getSessionCapabilities";

        /// <summary>
        /// Represents a Browser close command
        /// </summary>
        public static readonly string Close = "close";

        /// <summary>
        /// Represents a browser quit command
        /// </summary>
        public static readonly string Quit = "quit";

        /// <summary>
        /// Represents a GET command
        /// </summary>
        public static readonly string Get = "get";

        /// <summary>
        /// Represents a Browser going back command
        /// </summary>
        public static readonly string GoBack = "goBack";

        /// <summary>
        /// Represents a Browser going forward command
        /// </summary>
        public static readonly string GoForward = "goForward";

        /// <summary>
        /// Represents a Browser refreshing command
        /// </summary>
        public static readonly string Refresh = "refresh";

        /// <summary>
        /// Represents adding a cookie command
        /// </summary>
        public static readonly string AddCookie = "addCookie";

        /// <summary>
        /// Represents getting all cookies command
        /// </summary>
        public static readonly string GetAllCookies = "getCookies";

        /// <summary>
        /// Represents getting cookie command
        /// </summary>
        public static readonly string GetCookie = "getCookie";

        /// <summary>
        /// Represents deleting a cookie command
        /// </summary>
        public static readonly string DeleteCookie = "deleteCookie";

        /// <summary>
        /// Represents Deleting all cookies command
        /// </summary>
        public static readonly string DeleteAllCookies = "deleteAllCookies";

        /// <summary>
        /// Represents FindElement command
        /// </summary>
        public static readonly string FindElement = "findElement";

        /// <summary>
        /// Represents FindElements command
        /// </summary>
        public static readonly string FindElements = "findElements";

        /// <summary>
        /// Represents FindChildElement command
        /// </summary>
        public static readonly string FindChildElement = "findChildElement";

        /// <summary>
        /// Represents FindChildElements command
        /// </summary>
        public static readonly string FindChildElements = "findChildElements";

        /// <summary>
        /// Describes an element
        /// </summary>
        public static readonly string DescribeElement = "describeElement";

        /// <summary>
        /// Represents ClearElement command
        /// </summary>
        public static readonly string ClearElement = "clearElement";

        /// <summary>
        /// Represents ClickElement command
        /// </summary>
        public static readonly string ClickElement = "clickElement";

        /// <summary>
        /// Represents SendKeysToElements command
        /// </summary>
        public static readonly string SendKeysToElement = "sendKeysToElement";

        /// <summary>
        /// Represents TapElement command
        /// </summary>
        public static readonly string TapElement = "tapElement";

        /// <summary>
        /// Represents SubmitElement command
        /// </summary>
        public static readonly string SubmitElement = "submitElement";

        /// <summary>
        /// Represents GetCurrentWindowHandle command
        /// </summary>
        public static readonly string GetCurrentWindowHandle = "getCurrentWindowHandle";

        /// <summary>
        /// Represents GetWindowHandles command
        /// </summary>
        public static readonly string GetWindowHandles = "getWindowHandles";

        /// <summary>
        /// Represents SwitchToWindow command
        /// </summary>
        public static readonly string SwitchToWindow = "switchToWindow";

        /// <summary>
        /// Represents NewWindow command
        /// </summary>
        public static readonly string NewWindow = "newWindow";

        /// <summary>
        /// Represents SwitchToFrame command
        /// </summary>
        public static readonly string SwitchToFrame = "switchToFrame";

        /// <summary>
        /// Represents SwitchToParentFrame command
        /// </summary>
        public static readonly string SwitchToParentFrame = "switchToParentFrame";

        /// <summary>
        /// Represents GetActiveElement command
        /// </summary>
        public static readonly string GetActiveElement = "getActiveElement";

        /// <summary>
        /// Represents GetCurrentUrl command
        /// </summary>
        public static readonly string GetCurrentUrl = "getCurrentUrl";

        /// <summary>
        /// Represents GetPageSource command
        /// </summary>
        public static readonly string GetPageSource = "getPageSource";

        /// <summary>
        /// Represents GetTitle command
        /// </summary>
        public static readonly string GetTitle = "getTitle";

        /// <summary>
        /// Represents ExecuteScript command
        /// </summary>
        public static readonly string ExecuteScript = "executeScript";

        /// <summary>
        /// Represents ExecuteAsyncScript command
        /// </summary>
        public static readonly string ExecuteAsyncScript = "executeAsyncScript";

        /// <summary>
        /// Represents GetElementText command
        /// </summary>
        public static readonly string GetElementText = "getElementText";

        /// <summary>
        /// Represents GetElementTagName command
        /// </summary>
        public static readonly string GetElementTagName = "getElementTagName";

        /// <summary>
        /// Represents IsElementSelected command
        /// </summary>
        public static readonly string IsElementSelected = "isElementSelected";

        /// <summary>
        /// Represents IsElementEnabled command
        /// </summary>
        public static readonly string IsElementEnabled = "isElementEnabled";

        /// <summary>
        /// Represents IsElementDisplayed command
        /// </summary>
        public static readonly string IsElementDisplayed = "isElementDisplayed";

        /// <summary>
        /// Represents GetElementLocation command
        /// </summary>
        public static readonly string GetElementLocation = "getElementLocation";

        /// <summary>
        /// Represents GetElementLocationOnceScrolledIntoView command
        /// </summary>
        public static readonly string GetElementLocationOnceScrolledIntoView = "getElementLocationOnceScrolledIntoView";

        /// <summary>
        /// Represents GetElementSize command
        /// </summary>
        public static readonly string GetElementSize = "getElementSize";

        /// <summary>
        /// Represents GetElementRect command
        /// </summary>
        public static readonly string GetElementRect = "getElementRect";

        /// <summary>
        /// Represents GetElementAttribute command
        /// </summary>
        public static readonly string GetElementAttribute = "getElementAttribute";

        /// <summary>
        /// Represents GetElementProperty command
        /// </summary>
        public static readonly string GetElementProperty = "getElementProperty";

        /// <summary>
        /// Represents GetElementValueOfCSSProperty command
        /// </summary>
        public static readonly string GetElementValueOfCssProperty = "getElementValueOfCssProperty";

        /// <summary>
        /// Represents ElementEquals command
        /// </summary>
        public static readonly string ElementEquals = "elementEquals";

        /// <summary>
        /// Represents Screenshot command
        /// </summary>
        public static readonly string Screenshot = "screenshot";

        /// <summary>
        /// Represents the ElementScreenshot command
        /// </summary>
        public static readonly string ElementScreenshot = "elementScreenshot";

        /// <summary>
        /// Represents GetOrientation command
        /// </summary>
        public static readonly string GetOrientation = "getOrientation";

        /// <summary>
        /// Represents SetOrientation command
        /// </summary>
        public static readonly string SetOrientation = "setOrientation";

        /// <summary>
        /// Represents GetWindowSize command
        /// </summary>
        public static readonly string GetWindowSize = "getWindowSize";

        /// <summary>
        /// Represents SetWindowSize command
        /// </summary>
        public static readonly string SetWindowSize = "setWindowSize";

        /// <summary>
        /// Represents GetWindowPosition command
        /// </summary>
        public static readonly string GetWindowPosition = "getWindowPosition";

        /// <summary>
        /// Represents SetWindowPosition command
        /// </summary>
        public static readonly string SetWindowPosition = "setWindowPosition";

        /// <summary>
        /// Represents GetWindowRect command
        /// </summary>
        public static readonly string GetWindowRect = "getWindowRect";

        /// <summary>
        /// Represents SetWindowRect command
        /// </summary>
        public static readonly string SetWindowRect = "setWindowRect";

        /// <summary>
        /// Represents MaximizeWindow command
        /// </summary>
        public static readonly string MaximizeWindow = "maximizeWindow";

        /// <summary>
        /// Represents MinimizeWindow command
        /// </summary>
        public static readonly string MinimizeWindow = "minimizeWindow";

        /// <summary>
        /// Represents FullScreenWindow command
        /// </summary>
        public static readonly string FullScreenWindow = "fullScreenWindow";

        /// <summary>
        /// Represents the DismissAlert command
        /// </summary>
        public static readonly string DismissAlert = "dismissAlert";

        /// <summary>
        /// Represents the AcceptAlert command
        /// </summary>
        public static readonly string AcceptAlert = "acceptAlert";

        /// <summary>
        /// Represents the GetAlertText command
        /// </summary>
        public static readonly string GetAlertText = "getAlertText";

        /// <summary>
        /// Represents the SetAlertValue command
        /// </summary>
        public static readonly string SetAlertValue = "setAlertValue";

        /// <summary>
        /// Represents the Authenticate command
        /// </summary>
        public static readonly string SetAlertCredentials = "setAlertCredentials";

        /// <summary>
        /// Represents the ImplicitlyWait command
        /// </summary>
        public static readonly string ImplicitlyWait = "implicitlyWait";

        /// <summary>
        /// Represents the SetAsyncScriptTimeout command
        /// </summary>
        public static readonly string SetAsyncScriptTimeout = "setScriptTimeout";

        /// <summary>
        /// Represents the SetTimeout command
        /// </summary>
        public static readonly string SetTimeouts = "setTimeouts";

        /// <summary>
        /// Represents the SetTimeout command
        /// </summary>
        public static readonly string GetTimeouts = "getTimeouts";

        /// <summary>
        /// Represents the Actions command.
        /// </summary>
        public static readonly string Actions = "actions";

        /// <summary>
        /// Represents the CancelActions command.
        /// </summary>
        public static readonly string CancelActions = "cancelActions";

        /// <summary>
        /// Represents the MouseClick command.
        /// </summary>
        public static readonly string MouseClick = "mouseClick";

        /// <summary>
        /// Represents the MouseDoubleClick command.
        /// </summary>
        public static readonly string MouseDoubleClick = "mouseDoubleClick";

        /// <summary>
        /// Represents the MouseDown command.
        /// </summary>
        public static readonly string MouseDown = "mouseDown";

        /// <summary>
        /// Represents the MouseUp command.
        /// </summary>
        public static readonly string MouseUp = "mouseUp";

        /// <summary>
        /// Represents the MouseMoveTo command.
        /// </summary>
        public static readonly string MouseMoveTo = "mouseMoveTo";

        /// <summary>
        /// Represents the SendKeysToActiveElement command.
        /// </summary>
        public static readonly string SendKeysToActiveElement = "sendKeysToActiveElement";

        /// <summary>
        /// Represents the UploadFile command.
        /// </summary>
        public static readonly string UploadFile = "uploadFile";

        /// <summary>
        /// Represents the TouchSingleTap command.
        /// </summary>
        public static readonly string TouchSingleTap = "touchSingleTap";

        /// <summary>
        /// Represents the TouchPress command.
        /// </summary>
        public static readonly string TouchPress = "touchDown";

        /// <summary>
        /// Represents the TouchRelease command.
        /// </summary>
        public static readonly string TouchRelease = "touchUp";

        /// <summary>
        /// Represents the TouchMove command.
        /// </summary>
        public static readonly string TouchMove = "touchMove";

        /// <summary>
        /// Represents the TouchScroll command.
        /// </summary>
        public static readonly string TouchScroll = "touchScroll";

        /// <summary>
        /// Represents the TouchDoubleTap command.
        /// </summary>
        public static readonly string TouchDoubleTap = "touchDoubleTap";

        /// <summary>
        /// Represents the TouchLongPress command.
        /// </summary>
        public static readonly string TouchLongPress = "touchLongPress";

        /// <summary>
        /// Represents the TouchFlick command.
        /// </summary>
        public static readonly string TouchFlick = "touchFlick";

        /// <summary>
        /// Represents the GetLocation command.
        /// </summary>
        public static readonly string GetLocation = "getLocation";

        /// <summary>
        /// Represents the SetLocation command.
        /// </summary>
        public static readonly string SetLocation = "setLocation";

        /// <summary>
        /// Represents the GetAppCache command.
        /// </summary>
        public static readonly string GetAppCache = "getAppCache";

        /// <summary>
        /// Represents the application cache GetStatus command.
        /// </summary>
        public static readonly string GetAppCacheStatus = "getStatus";

        /// <summary>
        /// Represents the ClearAppCache command.
        /// </summary>
        public static readonly string ClearAppCache = "clearAppCache";

        /// <summary>
        /// Represents the GetLocalStorageItem command.
        /// </summary>
        public static readonly string GetLocalStorageItem = "getLocalStorageItem";

        /// <summary>
        /// Represents the GetLocalStorageKeys command.
        /// </summary>
        public static readonly string GetLocalStorageKeys = "getLocalStorageKeys";

        /// <summary>
        /// Represents the SetLocalStorageItem command.
        /// </summary>
        public static readonly string SetLocalStorageItem = "setLocalStorageItem";

        /// <summary>
        /// Represents the RemoveLocalStorageItem command.
        /// </summary>
        public static readonly string RemoveLocalStorageItem = "removeLocalStorageItem";

        /// <summary>
        /// Represents the ClearLocalStorage command.
        /// </summary>
        public static readonly string ClearLocalStorage = "clearLocalStorage";

        /// <summary>
        /// Represents the GetLocalStorageSize command.
        /// </summary>
        public static readonly string GetLocalStorageSize = "getLocalStorageSize";

        /// <summary>
        /// Represents the GetSessionStorageItem command.
        /// </summary>
        public static readonly string GetSessionStorageItem = "getSessionStorageItem";

        /// <summary>
        /// Represents the GetSessionStorageKeys command.
        /// </summary>
        public static readonly string GetSessionStorageKeys = "getSessionStorageKeys";

        /// <summary>
        /// Represents the SetSessionStorageItem command.
        /// </summary>
        public static readonly string SetSessionStorageItem = "setSessionStorageItem";

        /// <summary>
        /// Represents the RemoveSessionStorageItem command.
        /// </summary>
        public static readonly string RemoveSessionStorageItem = "removeSessionStorageItem";

        /// <summary>
        /// Represents the ClearSessionStorage command.
        /// </summary>
        public static readonly string ClearSessionStorage = "clearSessionStorage";

        /// <summary>
        /// Represents the GetSessionStorageSize command.
        /// </summary>
        public static readonly string GetSessionStorageSize = "getSessionStorageSize";

        /// <summary>
        /// Represents the GetAvailableLogTypes command.
        /// </summary>
        public static readonly string GetAvailableLogTypes = "getAvailableLogTypes";

        /// <summary>
        /// Represents the GetLog command.
        /// </summary>
        public static readonly string GetLog = "getLog";
    }
}
