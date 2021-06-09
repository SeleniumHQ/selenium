// <copyright file="W3CWireProtocolCommandInfoRepository.cs" company="WebDriver Committers">
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
// </copyright>

using System;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Holds the information about all commands specified by the JSON wire protocol.
    /// This class cannot be inherited, as it is intended to be a singleton, and
    /// allowing subclasses introduces the possibility of multiple instances.
    /// </summary>
    public sealed class W3CWireProtocolCommandInfoRepository : CommandInfoRepository
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="W3CWireProtocolCommandInfoRepository"/> class.
        /// </summary>
        public W3CWireProtocolCommandInfoRepository()
            : base()
        {
            this.InitializeCommandDictionary();
        }

        /// <summary>
        /// Gets the level of the W3C WebDriver specification that this repository supports.
        /// </summary>
        public override int SpecificationLevel
        {
            get { return 1; }
        }

        /// <summary>
        /// Gets the <see cref="Type"/> that is valid for this <see cref="CommandInfoRepository"/>
        /// </summary>
        protected override Type RepositoryCommandInfoType
        {
            get { return typeof(HttpCommandInfo); }
        }

        /// <summary>
        /// Initializes the dictionary of commands for the CommandInfoRepository
        /// </summary>
        protected override void InitializeCommandDictionary()
        {
            this.TryAddCommand(DriverCommand.Status, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/status"));
            this.TryAddCommand(DriverCommand.NewSession, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session"));
            this.TryAddCommand(DriverCommand.Quit, new HttpCommandInfo(HttpCommandInfo.DeleteCommand, "/session/{sessionId}"));
            this.TryAddCommand(DriverCommand.GetTimeouts, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/timeouts"));
            this.TryAddCommand(DriverCommand.SetTimeouts, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/timeouts"));
            this.TryAddCommand(DriverCommand.Get, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/url"));
            this.TryAddCommand(DriverCommand.GetCurrentUrl, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/url"));
            this.TryAddCommand(DriverCommand.GoBack, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/back"));
            this.TryAddCommand(DriverCommand.GoForward, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/forward"));
            this.TryAddCommand(DriverCommand.Refresh, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/refresh"));
            this.TryAddCommand(DriverCommand.GetTitle, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/title"));
            this.TryAddCommand(DriverCommand.GetCurrentWindowHandle, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/window"));
            this.TryAddCommand(DriverCommand.Close, new HttpCommandInfo(HttpCommandInfo.DeleteCommand, "/session/{sessionId}/window"));
            this.TryAddCommand(DriverCommand.SwitchToWindow, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/window"));
            this.TryAddCommand(DriverCommand.GetWindowHandles, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/window/handles"));
            this.TryAddCommand(DriverCommand.NewWindow, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/window/new"));
            this.TryAddCommand(DriverCommand.SwitchToFrame, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/frame"));
            this.TryAddCommand(DriverCommand.SwitchToParentFrame, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/frame/parent"));

            this.TryAddCommand(DriverCommand.GetWindowRect, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/window/rect"));
            this.TryAddCommand(DriverCommand.SetWindowRect, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/window/rect"));

            this.TryAddCommand(DriverCommand.MaximizeWindow, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/window/maximize"));
            this.TryAddCommand(DriverCommand.MinimizeWindow, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/window/minimize"));
            this.TryAddCommand(DriverCommand.FullScreenWindow, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/window/fullscreen"));
            this.TryAddCommand(DriverCommand.GetActiveElement, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/element/active"));
            this.TryAddCommand(DriverCommand.GetElementShadowRoot, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/element/{id}/shadow"));
            this.TryAddCommand(DriverCommand.FindElement, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/element"));
            this.TryAddCommand(DriverCommand.FindElements, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/elements"));
            this.TryAddCommand(DriverCommand.FindChildElement, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/element/{id}/element"));
            this.TryAddCommand(DriverCommand.FindChildElements, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/element/{id}/elements"));
            this.TryAddCommand(DriverCommand.FindShadowChildElement, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/shadow/{id}/element"));
            this.TryAddCommand(DriverCommand.FindShadowChildElements, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/shadow/{id}/elements"));
            this.TryAddCommand(DriverCommand.IsElementSelected, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/element/{id}/selected"));
            this.TryAddCommand(DriverCommand.ClickElement, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/element/{id}/click"));
            this.TryAddCommand(DriverCommand.ClearElement, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/element/{id}/clear"));
            this.TryAddCommand(DriverCommand.SendKeysToElement, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/element/{id}/value"));
            this.TryAddCommand(DriverCommand.GetElementAttribute, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/element/{id}/attribute/{name}"));
            this.TryAddCommand(DriverCommand.GetElementProperty, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/element/{id}/property/{name}"));
            this.TryAddCommand(DriverCommand.GetElementValueOfCssProperty, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/element/{id}/css/{name}"));
            this.TryAddCommand(DriverCommand.GetComputedAccessibleLabel, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/element/{id}/computedlabel"));
            this.TryAddCommand(DriverCommand.GetComputedAccessibleRole, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/element/{id}/computedrole"));
            this.TryAddCommand(DriverCommand.GetElementText, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/element/{id}/text"));
            this.TryAddCommand(DriverCommand.GetElementTagName, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/element/{id}/name"));
            this.TryAddCommand(DriverCommand.GetElementRect, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/element/{id}/rect"));
            this.TryAddCommand(DriverCommand.IsElementEnabled, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/element/{id}/enabled"));
            this.TryAddCommand(DriverCommand.GetPageSource, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/source"));
            this.TryAddCommand(DriverCommand.ExecuteScript, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/execute/sync"));
            this.TryAddCommand(DriverCommand.ExecuteAsyncScript, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/execute/async"));
            this.TryAddCommand(DriverCommand.GetAllCookies, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/cookie"));
            this.TryAddCommand(DriverCommand.GetCookie, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/cookie/{name}"));
            this.TryAddCommand(DriverCommand.AddCookie, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/cookie"));
            this.TryAddCommand(DriverCommand.DeleteCookie, new HttpCommandInfo(HttpCommandInfo.DeleteCommand, "/session/{sessionId}/cookie/{name}"));
            this.TryAddCommand(DriverCommand.DeleteAllCookies, new HttpCommandInfo(HttpCommandInfo.DeleteCommand, "/session/{sessionId}/cookie"));
            this.TryAddCommand(DriverCommand.Actions, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/actions"));
            this.TryAddCommand(DriverCommand.CancelActions, new HttpCommandInfo(HttpCommandInfo.DeleteCommand, "/session/{sessionId}/actions"));
            this.TryAddCommand(DriverCommand.DismissAlert, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/alert/dismiss"));
            this.TryAddCommand(DriverCommand.AcceptAlert, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/alert/accept"));
            this.TryAddCommand(DriverCommand.GetAlertText, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/alert/text"));
            this.TryAddCommand(DriverCommand.SetAlertValue, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/alert/text"));
            this.TryAddCommand(DriverCommand.Screenshot, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/screenshot"));
            this.TryAddCommand(DriverCommand.ElementScreenshot, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/element/{id}/screenshot"));
            this.TryAddCommand(DriverCommand.Print, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/print"));

            // Commands below here are not included in the W3C specification,
            // but are required for full fidelity of execution with Selenium's
            // local-end implementation of WebDriver.
            this.TryAddCommand(DriverCommand.GetSessionCapabilities, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}"));
            this.TryAddCommand(DriverCommand.IsElementDisplayed, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/element/{id}/displayed"));
            this.TryAddCommand(DriverCommand.ElementEquals, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/element/{id}/equals/{other}"));
            this.TryAddCommand(DriverCommand.DefineDriverMapping, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/config/drivers"));
            this.TryAddCommand(DriverCommand.UploadFile, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/se/file"));
            this.TryAddCommand(DriverCommand.SetAlertCredentials, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/alert/credentials"));
            this.TryAddCommand(DriverCommand.GetSessionList, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/sessions"));
            this.TryAddCommand(DriverCommand.GetElementLocationOnceScrolledIntoView, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/element/{id}/location_in_view"));
            this.TryAddCommand(DriverCommand.DescribeElement, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/element/{id}"));
            this.TryAddCommand(DriverCommand.GetOrientation, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/orientation"));
            this.TryAddCommand(DriverCommand.SetOrientation, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/orientation"));

            // HTML5 commands
            this.TryAddCommand(DriverCommand.GetLocation, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/location"));
            this.TryAddCommand(DriverCommand.SetLocation, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/location"));
            this.TryAddCommand(DriverCommand.GetAppCache, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/application_cache"));
            this.TryAddCommand(DriverCommand.GetAppCacheStatus, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/application_cache/status"));
            this.TryAddCommand(DriverCommand.ClearAppCache, new HttpCommandInfo(HttpCommandInfo.DeleteCommand, "/session/{sessionId}/application_cache/clear"));
            this.TryAddCommand(DriverCommand.GetLocalStorageKeys, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/local_storage"));
            this.TryAddCommand(DriverCommand.SetLocalStorageItem, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/local_storage"));
            this.TryAddCommand(DriverCommand.ClearLocalStorage, new HttpCommandInfo(HttpCommandInfo.DeleteCommand, "/session/{sessionId}/local_storage"));
            this.TryAddCommand(DriverCommand.GetLocalStorageItem, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/local_storage/key/{key}"));
            this.TryAddCommand(DriverCommand.RemoveLocalStorageItem, new HttpCommandInfo(HttpCommandInfo.DeleteCommand, "/session/{sessionId}/local_storage/key/{key}"));
            this.TryAddCommand(DriverCommand.GetLocalStorageSize, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/local_storage/size"));
            this.TryAddCommand(DriverCommand.GetSessionStorageKeys, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/session_storage"));
            this.TryAddCommand(DriverCommand.SetSessionStorageItem, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/session_storage"));
            this.TryAddCommand(DriverCommand.ClearSessionStorage, new HttpCommandInfo(HttpCommandInfo.DeleteCommand, "/session/{sessionId}/session_storage"));
            this.TryAddCommand(DriverCommand.GetSessionStorageItem, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/session_storage/key/{key}"));
            this.TryAddCommand(DriverCommand.RemoveSessionStorageItem, new HttpCommandInfo(HttpCommandInfo.DeleteCommand, "/session/{sessionId}/session_storage/key/{key}"));
            this.TryAddCommand(DriverCommand.GetSessionStorageSize, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/session_storage/size"));
        }
    }
}
