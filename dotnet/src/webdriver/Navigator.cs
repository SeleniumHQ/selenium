// <copyright file="Navigator.cs" company="WebDriver Committers">
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
using System.Threading.Tasks;
using OpenQA.Selenium.Internal;
using System.Collections.Generic;
using WebDriverBiDi.BrowsingContext;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Provides a mechanism for Navigating with the driver.
    /// </summary>
    internal class Navigator : INavigation
    {
        private WebDriver driver;

        /// <summary>
        /// Initializes a new instance of the <see cref="Navigator"/> class
        /// </summary>
        /// <param name="driver">Driver in use</param>
        public Navigator(WebDriver driver)
        {
            this.driver = driver;
        }

        /// <summary>
        /// Move the browser back
        /// </summary>
        public void Back()
        {
            AsyncHelper.RunSync(this.BackAsync);
        }

        /// <summary>
        /// Move back a single entry in the browser's history as an asynchronous task.
        /// </summary>
        /// <returns>A task object representing the asynchronous operation</returns>
        public async Task BackAsync()
        {
            if (this.driver.BiDiDriver != null)
            {
                var traverseHistoryCommandParameters =
                    new TraverseHistoryCommandParameters(driver.BrowsingContextId, -1);
                await this.driver.BiDiDriver.BrowsingContext.TraverseHistoryAsync(traverseHistoryCommandParameters)
                    .ConfigureAwait(false);
            }
            else
            {
                await this.driver.InternalExecuteAsync(DriverCommand.GoBack, null).ConfigureAwait(false);
            }
        }

        /// <summary>
        /// Move the browser forward
        /// </summary>
        public void Forward()
        {
            AsyncHelper.RunSync(this.ForwardAsync);
        }

        /// <summary>
        /// Move the browser forward as an asynchronous task
        /// </summary>
        /// <returns>A task object representing the asynchronous operation</returns>
        public async Task ForwardAsync()
        {
            if (this.driver.BiDiDriver != null)
            {
                var traverseHistoryCommandParameters =
                    new TraverseHistoryCommandParameters(driver.BrowsingContextId, 1);
                await this.driver.BiDiDriver.BrowsingContext.TraverseHistoryAsync(traverseHistoryCommandParameters)
                    .ConfigureAwait(false);
            }
            else
            {
                await this.driver.InternalExecuteAsync(DriverCommand.GoForward, null).ConfigureAwait(false);
            }
        }

        /// <summary>
        /// Navigate to a url
        /// </summary>
        /// <param name="url">String of where you want the browser to go to</param>
        public void GoToUrl(string url)
        {
            AsyncHelper.RunSync(() => this.GoToUrlAsync(url));
        }

        /// <summary>
        /// Navigate to a url as an asynchronous task
        /// </summary>
        /// <param name="url">String of where you want the browser to go to</param>
        /// <returns>A task object representing the asynchronous operation</returns>
        public async Task GoToUrlAsync(string url)
        {
            if (url == null)
            {
                throw new ArgumentNullException(nameof(url), "URL cannot be null.");
            }

            if (this.driver.BiDiDriver != null)
            {
                await driver.BiDiDriver.BrowsingContext.NavigateAsync(new NavigateCommandParameters(driver.BrowsingContextId, url)).ConfigureAwait(false);
            }
            else
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "url", url }
                };
                this.driver.InternalExecute(DriverCommand.Get, parameters);
            }
        }

        /// <summary>
        /// Navigate to a url
        /// </summary>
        /// <param name="url">Uri object of where you want the browser to go to</param>
        public void GoToUrl(Uri url)
        {
            AsyncHelper.RunSync(() => this.GoToUrlAsync(url));
        }

        /// <summary>
        /// Navigate to a url as an asynchronous task
        /// </summary>
        /// <param name="url">Uri of where you want the browser to go to</param>
        /// <returns>A task object representing the asynchronous operation</returns>
        public async Task GoToUrlAsync(Uri url)
        {
            if (url == null)
            {
                throw new ArgumentNullException(nameof(url), "URL cannot be null.");
            }

            await this.GoToUrlAsync(url.ToString()).ConfigureAwait(false);
        }

        /// <summary>
        /// Refresh the browser
        /// </summary>
        public void Refresh()
        {
            AsyncHelper.RunSync(this.RefreshAsync);
        }

        /// <summary>
        /// Refresh the browser as an asynchronous task
        /// </summary>
        /// <returns>A task object representing the asynchronous operation</returns>
        public async Task RefreshAsync()
        {
            if (this.driver.BiDiDriver != null)
            {
                var reloadCommandParameters =
                    new ReloadCommandParameters(driver.BrowsingContextId);
                await this.driver.BiDiDriver.BrowsingContext.ReloadAsync(reloadCommandParameters).ConfigureAwait(false);
            }
            else
            {
                await this.driver.InternalExecuteAsync(DriverCommand.Refresh, null).ConfigureAwait(false);
            }
        }
    }
}
