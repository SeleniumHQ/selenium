// <copyright file="DriverCommand.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2011 Software Freedom Conservancy
//
// Licensed under the Apache License = string.Empty; Version 2.0 (the "License");
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
        public static readonly string GetAllCookies = "getAllCookies";

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
        /// Represents SwitchToFrame command
        /// </summary>
        public static readonly string SwitchToFrame = "switchToFrame";

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
        /// Represents GetElementAttribute command
        /// </summary>
        public static readonly string GetElementAttribute = "getElementAttribute";

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
        /// Represents MaximizeWindow command
        /// </summary>
        public static readonly string MaximizeWindow = "maximizeWindow";

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
        /// Represents the ImplicitlyWait command
        /// </summary>
        public static readonly string ImplicitlyWait = "implicitlyWait";

        /// <summary>
        /// Represents the SetAsyncScriptTimeout command
        /// </summary>
        public static readonly string SetAsyncScriptTimeout = "setAsyncScriptTimeout";

        /// <summary>
        /// Represents the SetTimeout command
        /// </summary>
        public static readonly string SetTimeout = "setTimeout";

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
    }
}
