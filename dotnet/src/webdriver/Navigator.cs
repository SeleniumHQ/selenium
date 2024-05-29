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
using System.Collections.Generic;
using System.Threading.Tasks;
using WebDriverBiDi.BrowsingContext;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Provides a mechanism for Navigating with the driver.
    /// </summary>
    internal class Navigator : INavigation
    {
        private WebDriver driver;
        private string browsingContextId;
        private static readonly Dictionary<string, ReadinessState> PageLoadStrategyMapper = new()
        {
            {"normal", ReadinessState.Complete},
            {"eager", ReadinessState.Interactive},
            {"none", ReadinessState.None}
        };
        private ReadinessState readinessState;

        /// <summary>
        /// Initializes a new instance of the <see cref="Navigator"/> class
        /// </summary>
        /// <param name="driver">Driver in use</param>
        public Navigator(WebDriver driver)
        {
            this.driver = driver;
            this.browsingContextId = driver.CurrentWindowHandle;
            string strategyCap = driver.Capabilities.GetCapability("pageLoadStrategy") as string;
            this.readinessState = strategyCap == null ? ReadinessState.Complete : PageLoadStrategyMapper[strategyCap];
        }

        /// <summary>
        /// Move back a single entry in the browser's history.
        /// </summary>
        public void Back()
        {
            Task.Run(async delegate
            {
                await this.BackAsync();
            }).GetAwaiter().GetResult();
        }

        /// <summary>
        /// Move back a single entry in the browser's history as an asynchronous task.
        /// </summary>
        /// <returns>A task object representing the asynchronous operation.</returns>
        public async Task BackAsync()
        {
            if (this.driver.BiDiDriver != null)
            {
                var traverseHistoryCommandParameters =
                    new TraverseHistoryCommandParameters(this.browsingContextId, -1);
                await this.driver.BiDiDriver.BrowsingContext.TraverseHistoryAsync(traverseHistoryCommandParameters)
                    .ConfigureAwait(false);
            }
            else
            {
                await this.driver.InternalExecuteAsync(DriverCommand.GoBack, null).ConfigureAwait(false);
            }
        }

        /// <summary>
        /// Move a single "item" forward in the browser's history.
        /// </summary>
        public void Forward()
        {
            Task.Run(async delegate
            {
                await this.ForwardAsync();
            }).GetAwaiter().GetResult();
        }

        /// <summary>
        /// Move a single "item" forward in the browser's history as an asynchronous task.
        /// </summary>
        /// <returns>A task object representing the asynchronous operation.</returns>
        public async Task ForwardAsync()
        {
            if (this.driver.BiDiDriver != null)
            {
                var traverseHistoryCommandParameters =
                    new TraverseHistoryCommandParameters(this.browsingContextId, 1);
                await this.driver.BiDiDriver.BrowsingContext.TraverseHistoryAsync(traverseHistoryCommandParameters)
                    .ConfigureAwait(false);
            }
            else
            {
                await this.driver.InternalExecuteAsync(DriverCommand.GoForward, null).ConfigureAwait(false);
            }
        }

        /// <summary>
        /// Navigate to a url.
        /// </summary>
        /// <param name="url">String of where you want the browser to go to</param>
        public void GoToUrl(string url)
        {
            Task.Run(async delegate
            {
                await this.GoToUrlAsync(url);
            }).GetAwaiter().GetResult();
        }

        /// <summary>
        /// Navigate to a url as an asynchronous task.
        /// </summary>
        /// <param name="url">String of where you want the browser to go.</param>
        /// <returns>A task object representing the asynchronous operation.</returns>
        public async Task GoToUrlAsync(string url)
        {
            if (url == null)
            {
                throw new ArgumentNullException(nameof(url), "URL cannot be null.");
            }

            if (this.driver.BiDiDriver != null)
            {
                NavigateCommandParameters navigateCommandParameters = new NavigateCommandParameters(this.browsingContextId, url)
                    {
                        Wait = this.readinessState
                    };
                await driver.BiDiDriver.BrowsingContext.NavigateAsync(navigateCommandParameters).ConfigureAwait(false);
            }
            else
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "url", url }
                };
                await this.driver.InternalExecuteAsync(DriverCommand.Get, parameters).ConfigureAwait(false);
            }
        }

        /// <summary>
        /// Navigate to a url.
        /// </summary>
        /// <param name="url">Uri object of where you want the browser to go.</param>
        public void GoToUrl(Uri url)
        {
            Task.Run(async delegate
            {
                await this.GoToUrlAsync(url);
            }).GetAwaiter().GetResult();
        }

        /// <summary>
        /// Navigate to a url as an asynchronous task.
        /// </summary>
        /// <param name="url">Uri object of where you want the browser to go.</param>
        /// <returns>A task object representing the asynchronous operation.</returns>
        public async Task GoToUrlAsync(Uri url)
        {
            if (url == null)
            {
                throw new ArgumentNullException(nameof(url), "URL cannot be null.");
            }

            await this.GoToUrlAsync(url.ToString()).ConfigureAwait(false);
        }

        /// <summary>
        /// Reload the current page.
        /// </summary>
        public void Refresh()
        {
            Task.Run(async delegate
            {
                await this.RefreshAsync();
            }).GetAwaiter().GetResult();
        }

        /// <summary>
        /// Reload the current page as an asynchronous task.
        /// </summary>
        /// <returns>A task object representing the asynchronous operation.</returns>
        public async Task RefreshAsync()
        {
            if (this.driver.BiDiDriver != null)
            {
                var reloadCommandParameters =
                    new ReloadCommandParameters(this.browsingContextId)
                    {
                        Wait =  this.readinessState
                    };
                await this.driver.BiDiDriver.BrowsingContext.ReloadAsync(reloadCommandParameters).ConfigureAwait(false);
            }
            else
            {
                await this.driver.InternalExecuteAsync(DriverCommand.Refresh, null).ConfigureAwait(false);
            }
        }
    }
}
