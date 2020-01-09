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
        /// Initializes the dictionary of commands for the CommandInfoRepository
        /// </summary>
        protected override void InitializeCommandDictionary()
        {
            this.TryAddCommand(DriverCommand.Status, new CommandInfo(CommandInfo.GetCommand, "/status"));
            this.TryAddCommand(DriverCommand.NewSession, new CommandInfo(CommandInfo.PostCommand, "/session"));
            this.TryAddCommand(DriverCommand.Quit, new CommandInfo(CommandInfo.DeleteCommand, "/session/{sessionId}"));
            this.TryAddCommand(DriverCommand.GetTimeouts, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/timeouts"));
            this.TryAddCommand(DriverCommand.SetTimeouts, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/timeouts"));
            this.TryAddCommand(DriverCommand.Get, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/url"));
            this.TryAddCommand(DriverCommand.GetCurrentUrl, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/url"));
            this.TryAddCommand(DriverCommand.GoBack, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/back"));
            this.TryAddCommand(DriverCommand.GoForward, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/forward"));
            this.TryAddCommand(DriverCommand.Refresh, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/refresh"));
            this.TryAddCommand(DriverCommand.GetTitle, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/title"));
            this.TryAddCommand(DriverCommand.GetCurrentWindowHandle, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/window"));
            this.TryAddCommand(DriverCommand.Close, new CommandInfo(CommandInfo.DeleteCommand, "/session/{sessionId}/window"));
            this.TryAddCommand(DriverCommand.SwitchToWindow, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/window"));
            this.TryAddCommand(DriverCommand.GetWindowHandles, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/window/handles"));
            this.TryAddCommand(DriverCommand.NewWindow, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/window/new"));
            this.TryAddCommand(DriverCommand.SwitchToFrame, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/frame"));
            this.TryAddCommand(DriverCommand.SwitchToParentFrame, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/frame/parent"));

            this.TryAddCommand(DriverCommand.GetWindowRect, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/window/rect"));
            this.TryAddCommand(DriverCommand.SetWindowRect, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/window/rect"));

            this.TryAddCommand(DriverCommand.MaximizeWindow, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/window/maximize"));
            this.TryAddCommand(DriverCommand.MinimizeWindow, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/window/minimize"));
            this.TryAddCommand(DriverCommand.FullScreenWindow, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/window/fullscreen"));
            this.TryAddCommand(DriverCommand.GetActiveElement, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/active"));
            this.TryAddCommand(DriverCommand.FindElement, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element"));
            this.TryAddCommand(DriverCommand.FindElements, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/elements"));
            this.TryAddCommand(DriverCommand.FindChildElement, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element/{id}/element"));
            this.TryAddCommand(DriverCommand.FindChildElements, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element/{id}/elements"));
            this.TryAddCommand(DriverCommand.IsElementSelected, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/selected"));
            this.TryAddCommand(DriverCommand.ClickElement, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element/{id}/click"));
            this.TryAddCommand(DriverCommand.ClearElement, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element/{id}/clear"));
            this.TryAddCommand(DriverCommand.SendKeysToElement, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element/{id}/value"));
            this.TryAddCommand(DriverCommand.GetElementAttribute, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/attribute/{name}"));
            this.TryAddCommand(DriverCommand.GetElementProperty, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/property/{name}"));
            this.TryAddCommand(DriverCommand.GetElementValueOfCssProperty, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/css/{name}"));
            this.TryAddCommand(DriverCommand.GetElementText, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/text"));
            this.TryAddCommand(DriverCommand.GetElementTagName, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/name"));
            this.TryAddCommand(DriverCommand.GetElementRect, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/rect"));
            this.TryAddCommand(DriverCommand.IsElementEnabled, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/enabled"));
            this.TryAddCommand(DriverCommand.GetPageSource, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/source"));
            this.TryAddCommand(DriverCommand.ExecuteScript, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/execute/sync"));
            this.TryAddCommand(DriverCommand.ExecuteAsyncScript, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/execute/async"));
            this.TryAddCommand(DriverCommand.GetAllCookies, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/cookie"));
            this.TryAddCommand(DriverCommand.GetCookie, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/cookie/{name}"));
            this.TryAddCommand(DriverCommand.AddCookie, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/cookie"));
            this.TryAddCommand(DriverCommand.DeleteCookie, new CommandInfo(CommandInfo.DeleteCommand, "/session/{sessionId}/cookie/{name}"));
            this.TryAddCommand(DriverCommand.DeleteAllCookies, new CommandInfo(CommandInfo.DeleteCommand, "/session/{sessionId}/cookie"));
            this.TryAddCommand(DriverCommand.Actions, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/actions"));
            this.TryAddCommand(DriverCommand.CancelActions, new CommandInfo(CommandInfo.DeleteCommand, "/session/{sessionId}/actions"));
            this.TryAddCommand(DriverCommand.DismissAlert, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/alert/dismiss"));
            this.TryAddCommand(DriverCommand.AcceptAlert, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/alert/accept"));
            this.TryAddCommand(DriverCommand.GetAlertText, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/alert/text"));
            this.TryAddCommand(DriverCommand.SetAlertValue, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/alert/text"));
            this.TryAddCommand(DriverCommand.Screenshot, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/screenshot"));
            this.TryAddCommand(DriverCommand.ElementScreenshot, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/screenshot"));

            // Commands below here are not included in the W3C specification,
            // but are required for full fidelity of execution with Selenium's
            // local-end implementation of WebDriver.
            this.TryAddCommand(DriverCommand.GetSessionCapabilities, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}"));
            this.TryAddCommand(DriverCommand.IsElementDisplayed, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/displayed"));
            this.TryAddCommand(DriverCommand.ElementEquals, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/equals/{other}"));
            this.TryAddCommand(DriverCommand.DefineDriverMapping, new CommandInfo(CommandInfo.PostCommand, "/config/drivers"));
            this.TryAddCommand(DriverCommand.UploadFile, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/file"));
            this.TryAddCommand(DriverCommand.SetAlertCredentials, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/alert/credentials"));
            this.TryAddCommand(DriverCommand.GetSessionList, new CommandInfo(CommandInfo.GetCommand, "/sessions"));
            this.TryAddCommand(DriverCommand.GetElementLocationOnceScrolledIntoView, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/location_in_view"));
            this.TryAddCommand(DriverCommand.DescribeElement, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}"));
            this.TryAddCommand(DriverCommand.GetOrientation, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/orientation"));
            this.TryAddCommand(DriverCommand.SetOrientation, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/orientation"));

            // HTML5 commands
            this.TryAddCommand(DriverCommand.GetLocation, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/location"));
            this.TryAddCommand(DriverCommand.SetLocation, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/location"));
            this.TryAddCommand(DriverCommand.GetAppCache, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/application_cache"));
            this.TryAddCommand(DriverCommand.GetAppCacheStatus, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/application_cache/status"));
            this.TryAddCommand(DriverCommand.ClearAppCache, new CommandInfo(CommandInfo.DeleteCommand, "/session/{sessionId}/application_cache/clear"));
            this.TryAddCommand(DriverCommand.GetLocalStorageKeys, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/local_storage"));
            this.TryAddCommand(DriverCommand.SetLocalStorageItem, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/local_storage"));
            this.TryAddCommand(DriverCommand.ClearLocalStorage, new CommandInfo(CommandInfo.DeleteCommand, "/session/{sessionId}/local_storage"));
            this.TryAddCommand(DriverCommand.GetLocalStorageItem, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/local_storage/key/{key}"));
            this.TryAddCommand(DriverCommand.RemoveLocalStorageItem, new CommandInfo(CommandInfo.DeleteCommand, "/session/{sessionId}/local_storage/key/{key}"));
            this.TryAddCommand(DriverCommand.GetLocalStorageSize, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/local_storage/size"));
            this.TryAddCommand(DriverCommand.GetSessionStorageKeys, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/session_storage"));
            this.TryAddCommand(DriverCommand.SetSessionStorageItem, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/session_storage"));
            this.TryAddCommand(DriverCommand.ClearSessionStorage, new CommandInfo(CommandInfo.DeleteCommand, "/session/{sessionId}/session_storage"));
            this.TryAddCommand(DriverCommand.GetSessionStorageItem, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/session_storage/key/{key}"));
            this.TryAddCommand(DriverCommand.RemoveSessionStorageItem, new CommandInfo(CommandInfo.DeleteCommand, "/session/{sessionId}/session_storage/key/{key}"));
            this.TryAddCommand(DriverCommand.GetSessionStorageSize, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/session_storage/size"));
        }
    }
}
