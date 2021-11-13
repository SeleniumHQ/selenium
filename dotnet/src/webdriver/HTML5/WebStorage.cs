// <copyright file="WebStorage.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Html5
{
    /// <summary>
    /// Provides remote access to the <see cref="IWebStorage"/> API.
    /// </summary>
    public class WebStorage : IWebStorage
    {
        private WebDriver driver;

        /// <summary>
        /// Initializes a new instance of the <see cref="WebStorage"/> class.
        /// </summary>
        /// <param name="driver">The driver instance.</param>
        public WebStorage(WebDriver driver)
        {
            this.driver = driver;
            driver.RegisterDriverCommand(DriverCommand.GetLocalStorageKeys, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/local_storage"), true);
            driver.RegisterDriverCommand(DriverCommand.SetLocalStorageItem, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/local_storage"), true);
            driver.RegisterDriverCommand(DriverCommand.ClearLocalStorage, new HttpCommandInfo(HttpCommandInfo.DeleteCommand, "/session/{sessionId}/local_storage"), true);
            driver.RegisterDriverCommand(DriverCommand.GetLocalStorageItem, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/local_storage/key/{key}"), true);
            driver.RegisterDriverCommand(DriverCommand.RemoveLocalStorageItem, new HttpCommandInfo(HttpCommandInfo.DeleteCommand, "/session/{sessionId}/local_storage/key/{key}"), true);
            driver.RegisterDriverCommand(DriverCommand.GetLocalStorageSize, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/local_storage/size"), true);
            driver.RegisterDriverCommand(DriverCommand.GetSessionStorageKeys, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/session_storage"), true);
            driver.RegisterDriverCommand(DriverCommand.SetSessionStorageItem, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/session_storage"), true);
            driver.RegisterDriverCommand(DriverCommand.ClearSessionStorage, new HttpCommandInfo(HttpCommandInfo.DeleteCommand, "/session/{sessionId}/session_storage"), true);
            driver.RegisterDriverCommand(DriverCommand.GetSessionStorageItem, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/session_storage/key/{key}"), true);
            driver.RegisterDriverCommand(DriverCommand.RemoveSessionStorageItem, new HttpCommandInfo(HttpCommandInfo.DeleteCommand, "/session/{sessionId}/session_storage/key/{key}"), true);
            driver.RegisterDriverCommand(DriverCommand.GetSessionStorageSize, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/session_storage/size"), true);
        }

        /// <summary>
        /// Gets the local storage for the site currently opened in the browser.
        /// </summary>
        public ILocalStorage LocalStorage
        {
            get
            {
                return new LocalStorage(this.driver);
            }
        }

        /// <summary>
        /// Gets the session storage for the site currently opened in the browser.
        /// </summary>
        public ISessionStorage SessionStorage
        {
            get
            {
                return new SessionStorage(this.driver);
            }
        }
    }
}
