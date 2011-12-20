// <copyright file="DriverCommand.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2011 Software Freedom Conservancy
//
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
// </copyright>

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Values describing the list of commands understood by a remote server using the JSON wire protocol.
    /// </summary>
    public enum DriverCommand
    {
        /// <summary>
        /// Represents the Define Driver Mapping command
        /// </summary>
        DefineDriverMapping,

        /// <summary>
        /// Represents a New Session command
        /// </summary>
        NewSession,

        /// <summary>
        /// Represents the Get Session Capabilities command
        /// </summary>
        GetSessionCapabilities,

        /// <summary>
        /// Represents a Browser close command
        /// </summary>
        Close,

        /// <summary>
        /// Represents a browser quit command
        /// </summary>
        Quit,

        /// <summary>
        /// Represents a GET command
        /// </summary>
        Get,

        /// <summary>
        /// Represents a Browser going back command
        /// </summary>
        GoBack,

        /// <summary>
        /// Represents a Browser going forward command
        /// </summary>
        GoForward,

        /// <summary>
        /// Represents a Browser refreshing command
        /// </summary>
        Refresh,

        /// <summary>
        /// Represents adding a cookie command
        /// </summary>
        AddCookie,

        /// <summary>
        /// Represents getting all cookies command
        /// </summary>
        GetAllCookies,

        /// <summary>
        /// Represents deleting a cookie command
        /// </summary>        
        DeleteCookie,

        /// <summary>
        /// Represents Deleting all cookies command
        /// </summary>
        DeleteAllCookies,

        /// <summary>
        /// Represents findelement command
        /// </summary>
        FindElement,

        /// <summary>
        /// Represents findelements command
        /// </summary>
        FindElements,

        /// <summary>
        /// Represents findchildelements command
        /// </summary>
        FindChildElement,

        /// <summary>
        /// Represents findchildelements command
        /// </summary>
        FindChildElements,

        /// <summary>
        /// Describes an element
        /// </summary>
        DescribeElement,

        /// <summary>
        /// Represents clearelements command
        /// </summary>
        ClearElement,

        /// <summary>
        /// Represents clickelements command
        /// </summary>
        ClickElement,

        /// <summary>
        /// Represents SendKeysToElements command
        /// </summary>
        SendKeysToElement,

        /// <summary>
        /// Represents SubmitElement command
        /// </summary>
        SubmitElement,

        /// <summary>
        /// Represents findchildelements command
        /// </summary>
        GetCurrentWindowHandle,

        /// <summary>
        /// Represents GetWindowHandles command
        /// </summary>
        GetWindowHandles,

        /// <summary>
        /// Represents SwitchToWindow command
        /// </summary>
        SwitchToWindow,

        /// <summary>
        /// Represents SwitchToFrame command
        /// </summary>
        SwitchToFrame,

        /// <summary>
        /// Represents GetActiveElement command
        /// </summary>
        GetActiveElement,

        /// <summary>
        /// Represents GetCurrentUrl command
        /// </summary>
        GetCurrentUrl,

        /// <summary>
        /// Represents GetPageSource command
        /// </summary>
        GetPageSource,

        /// <summary>
        /// Represents GetTitle command
        /// </summary>
        GetTitle,

        /// <summary>
        /// Represents ExecuteScript command
        /// </summary>
        ExecuteScript,

        /// <summary>
        /// Represents ExecuteAsyncScript command
        /// </summary>
        ExecuteAsyncScript,

        /// <summary>
        /// Represents GetElementText command
        /// </summary>
        GetElementText,

        /// <summary>
        /// Represents GetElementTagName command
        /// </summary>
        GetElementTagName,

        /// <summary>
        /// Represents IsElementSelected command
        /// </summary>
        IsElementSelected,

        /// <summary>
        /// Represents IsElementEnabled command
        /// </summary>
        IsElementEnabled,

        /// <summary>
        /// Represents IsElementDisplayed command
        /// </summary>
        IsElementDisplayed,

        /// <summary>
        /// Represents GetElementLocation command
        /// </summary>
        GetElementLocation,

        /// <summary>
        /// Represents GetElementLocationOnceScrolledIntoView command
        /// </summary>
        GetElementLocationOnceScrolledIntoView,

        /// <summary>
        /// Represents GetElementSize command
        /// </summary>
        GetElementSize,

        /// <summary>
        /// Represents GetElementAttribute command
        /// </summary>
        GetElementAttribute,

        /// <summary>
        /// Represents GetElementValueOfCssProperty command
        /// </summary>
        GetElementValueOfCssProperty,

        /// <summary>
        /// Represents ElementEquals command
        /// </summary>
        ElementEquals,

        /// <summary>
        /// Represents Screenshot command
        /// </summary>
        Screenshot,

        /// <summary>
        /// Represents GetOrientation command
        /// </summary>
        GetOrientation,

        /// <summary>
        /// Represents SetOrientation command
        /// </summary>
        SetOrientation,

        /// <summary>
        /// Represents GetWindowSize command
        /// </summary>
        GetWindowSize,

        /// <summary>
        /// Represents SetWindowSize command
        /// </summary>
        SetWindowSize,

        /// <summary>
        /// Represents GetWindowPosition command
        /// </summary>
        GetWindowPosition,

        /// <summary>
        /// Represents SetWindowPosition command
        /// </summary>
        SetWindowPosition,

        /// <summary>
        /// Represents the DismissAlert command
        /// </summary>
        DismissAlert,

        /// <summary>
        /// Represents the AcceptAlert command
        /// </summary>
        AcceptAlert,

        /// <summary>
        /// Represents the GetAlertText command
        /// </summary>
        GetAlertText,

        /// <summary>
        /// Represents the SetAlertValue command
        /// </summary>
        SetAlertValue,

        /// <summary>
        /// Represents the ImplicitlyWait command
        /// </summary>
        ImplicitlyWait,

        /// <summary>
        /// Represents the SetAsyncScriptTimeout command
        /// </summary>
        SetAsyncScriptTimeout, 

        /// <summary>
        /// Represents the MouseClick command.
        /// </summary>
        MouseClick,

        /// <summary>
        /// Represents the MouseDoubleClick command.
        /// </summary>
        MouseDoubleClick,

        /// <summary>
        /// Represents the MouseDown command.
        /// </summary>
        MouseDown,

        /// <summary>
        /// Represents the MouseUp command.
        /// </summary>
        MouseUp,

        /// <summary>
        /// Represents the MouseMoveTo command.
        /// </summary>
        MouseMoveTo,

        /// <summary>
        /// Represents the SendKeysToActiveElement command.
        /// </summary>
        SendKeysToActiveElement
    }
}
