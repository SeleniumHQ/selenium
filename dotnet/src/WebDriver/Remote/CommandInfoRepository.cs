// <copyright file="CommandInfoRepository.cs" company="WebDriver Committers">
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

using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Holds the information about all commands specified by the JSON wire protocol.
    /// </summary>
    public class CommandInfoRepository
    {
        #region Private members
        private static object lockObject = new object();
        private static CommandInfoRepository collectionInstance;

        private Dictionary<string, CommandInfo> commandDictionary;
        #endregion

        #region Constructor
        /// <summary>
        /// Prevents a default instance of the <see cref="CommandInfoRepository"/> class from being created.
        /// </summary>
        private CommandInfoRepository()
        {
            this.commandDictionary = new Dictionary<string, CommandInfo>();
            this.InitializeCommandDictionary();
        }
        #endregion

        #region Public properties
        /// <summary>
        /// Gets the singleton instance of the <see cref="CommandInfoRepository"/>.
        /// </summary>
        public static CommandInfoRepository Instance
        {
            get
            {
                lock (lockObject)
                {
                    if (collectionInstance == null)
                    {
                        collectionInstance = new CommandInfoRepository();
                    }
                }

                return collectionInstance;
            }
        }
        #endregion

        #region Public methods
        /// <summary>
        /// Gets the <see cref="CommandInfo"/> for a <see cref="DriverCommand"/>.
        /// </summary>
        /// <param name="commandName">The <see cref="DriverCommand"/> for which to get the information.</param>
        /// <returns>The <see cref="CommandInfo"/> for the specified command.</returns>
        public CommandInfo GetCommandInfo(string commandName)
        {
            CommandInfo toReturn = null;
            if (this.commandDictionary.ContainsKey(commandName))
            {
                toReturn = this.commandDictionary[commandName];
            }

            return toReturn;
        }
        #endregion

        #region Private support methods
        private void InitializeCommandDictionary()
        {
            this.commandDictionary.Add(DriverCommand.DefineDriverMapping, new CommandInfo(CommandInfo.PostCommand, "/config/drivers"));
            this.commandDictionary.Add(DriverCommand.Status, new CommandInfo(CommandInfo.GetCommand, "/status"));
            this.commandDictionary.Add(DriverCommand.NewSession, new CommandInfo(CommandInfo.PostCommand, "/session"));
            this.commandDictionary.Add(DriverCommand.GetSessionList, new CommandInfo(CommandInfo.GetCommand, "/sessions"));
            this.commandDictionary.Add(DriverCommand.GetSessionCapabilities, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}"));
            this.commandDictionary.Add(DriverCommand.Quit, new CommandInfo(CommandInfo.DeleteCommand, "/session/{sessionId}"));
            this.commandDictionary.Add(DriverCommand.GetCurrentWindowHandle, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/window_handle"));
            this.commandDictionary.Add(DriverCommand.GetWindowHandles, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/window_handles"));
            this.commandDictionary.Add(DriverCommand.GetCurrentUrl, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/url"));
            this.commandDictionary.Add(DriverCommand.Get, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/url"));
            this.commandDictionary.Add(DriverCommand.GoForward, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/forward"));
            this.commandDictionary.Add(DriverCommand.GoBack, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/back"));
            this.commandDictionary.Add(DriverCommand.Refresh, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/refresh"));
            this.commandDictionary.Add(DriverCommand.ExecuteScript, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/execute"));
            this.commandDictionary.Add(DriverCommand.ExecuteAsyncScript, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/execute_async"));
            this.commandDictionary.Add(DriverCommand.Screenshot, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/screenshot"));
            this.commandDictionary.Add(DriverCommand.SwitchToFrame, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/frame"));
            this.commandDictionary.Add(DriverCommand.SwitchToWindow, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/window"));
            this.commandDictionary.Add(DriverCommand.GetAllCookies, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/cookie"));
            this.commandDictionary.Add(DriverCommand.AddCookie, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/cookie"));
            this.commandDictionary.Add(DriverCommand.DeleteAllCookies, new CommandInfo(CommandInfo.DeleteCommand, "/session/{sessionId}/cookie"));
            this.commandDictionary.Add(DriverCommand.DeleteCookie, new CommandInfo(CommandInfo.DeleteCommand, "/session/{sessionId}/cookie/{name}"));
            this.commandDictionary.Add(DriverCommand.GetPageSource, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/source"));
            this.commandDictionary.Add(DriverCommand.GetTitle, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/title"));
            this.commandDictionary.Add(DriverCommand.FindElement, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element"));
            this.commandDictionary.Add(DriverCommand.FindElements, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/elements"));
            this.commandDictionary.Add(DriverCommand.GetActiveElement, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element/active"));
            this.commandDictionary.Add(DriverCommand.FindChildElement, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element/{id}/element"));
            this.commandDictionary.Add(DriverCommand.FindChildElements, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element/{id}/elements"));
            this.commandDictionary.Add(DriverCommand.DescribeElement, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}"));
            this.commandDictionary.Add(DriverCommand.ClickElement, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element/{id}/click"));
            this.commandDictionary.Add(DriverCommand.GetElementText, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/text"));
            this.commandDictionary.Add(DriverCommand.SubmitElement, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element/{id}/submit"));
            this.commandDictionary.Add(DriverCommand.SendKeysToElement, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element/{id}/value"));
            this.commandDictionary.Add(DriverCommand.GetElementTagName, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/name"));
            this.commandDictionary.Add(DriverCommand.ClearElement, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element/{id}/clear"));
            this.commandDictionary.Add(DriverCommand.IsElementSelected, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/selected"));
            this.commandDictionary.Add(DriverCommand.IsElementEnabled, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/enabled"));
            this.commandDictionary.Add(DriverCommand.IsElementDisplayed, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/displayed"));
            this.commandDictionary.Add(DriverCommand.GetElementLocation, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/location"));
            this.commandDictionary.Add(DriverCommand.GetElementLocationOnceScrolledIntoView, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/location_in_view"));
            this.commandDictionary.Add(DriverCommand.GetElementSize, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/size"));
            this.commandDictionary.Add(DriverCommand.GetElementValueOfCssProperty, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/css/{propertyName}"));
            this.commandDictionary.Add(DriverCommand.GetElementAttribute, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/attribute/{name}"));
            this.commandDictionary.Add(DriverCommand.ElementEquals, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/equals/{other}"));
            this.commandDictionary.Add(DriverCommand.Close, new CommandInfo(CommandInfo.DeleteCommand, "/session/{sessionId}/window"));
            this.commandDictionary.Add(DriverCommand.GetWindowSize, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/window/{windowHandle}/size"));
            this.commandDictionary.Add(DriverCommand.SetWindowSize, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/window/{windowHandle}/size"));
            this.commandDictionary.Add(DriverCommand.GetWindowPosition, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/window/{windowHandle}/position"));
            this.commandDictionary.Add(DriverCommand.SetWindowPosition, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/window/{windowHandle}/position"));
            this.commandDictionary.Add(DriverCommand.MaximizeWindow, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/window/{windowHandle}/maximize"));
            this.commandDictionary.Add(DriverCommand.GetOrientation, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/orientation"));
            this.commandDictionary.Add(DriverCommand.SetOrientation, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/orientation"));
            this.commandDictionary.Add(DriverCommand.DismissAlert, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/dismiss_alert"));
            this.commandDictionary.Add(DriverCommand.AcceptAlert, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/accept_alert"));
            this.commandDictionary.Add(DriverCommand.GetAlertText, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/alert_text"));
            this.commandDictionary.Add(DriverCommand.SetAlertValue, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/alert_text"));
            this.commandDictionary.Add(DriverCommand.SetTimeout, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/timeouts"));
            this.commandDictionary.Add(DriverCommand.ImplicitlyWait, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/timeouts/implicit_wait"));
            this.commandDictionary.Add(DriverCommand.SetAsyncScriptTimeout, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/timeouts/async_script"));

            // Advanced interactions commands
            this.commandDictionary.Add(DriverCommand.MouseClick, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/click"));
            this.commandDictionary.Add(DriverCommand.MouseDoubleClick, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/doubleclick"));
            this.commandDictionary.Add(DriverCommand.MouseDown, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/buttondown"));
            this.commandDictionary.Add(DriverCommand.MouseUp, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/buttonup"));
            this.commandDictionary.Add(DriverCommand.MouseMoveTo, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/moveto"));
            this.commandDictionary.Add(DriverCommand.SendKeysToActiveElement, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/keys"));

            this.commandDictionary.Add(DriverCommand.UploadFile, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/file"));
        }
        #endregion
    }
}
