// <copyright file="ITimeouts.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium
{
    /// <summary>
    /// Defines the interface through which the user can define timeouts.
    /// </summary>
    public interface ITimeouts
    {
        /// <summary>
        /// Gets or sets the implicit wait timeout, which is the  amount of time the
        /// driver should wait when searching for an element if it is not immediately
        /// present.
        /// </summary>
        /// <remarks>
        /// When searching for a single element, the driver should poll the page
        /// until the element has been found, or this timeout expires before throwing
        /// a <see cref="NoSuchElementException"/>. When searching for multiple elements,
        /// the driver should poll the page until at least one element has been found
        /// or this timeout has expired.
        /// <para>
        /// Increasing the implicit wait timeout should be used judiciously as it
        /// will have an adverse effect on test run time, especially when used with
        /// slower location strategies like XPath.
        /// </para>
        /// </remarks>
        TimeSpan ImplicitWait { get; set; }

        /// <summary>
        /// Gets or sets the asynchronous script timeout, which is the amount
        /// of time the driver should wait when executing JavaScript asynchronously.
        /// This timeout only affects the <see cref="IJavaScriptExecutor.ExecuteAsyncScript(string, object[])"/>
        /// method.
        /// </summary>
        TimeSpan AsynchronousJavaScript { get; set; }

        /// <summary>
        /// Gets or sets the page load timeout, which is the amount of time the driver
        /// should wait for a page to load when setting the <see cref="IWebDriver.Url"/>
        /// property.
        /// </summary>
        TimeSpan PageLoad { get; set; }

        /// <summary>
        /// Specifies the amount of time the driver should wait when searching for an
        /// element if it is not immediately present.
        /// </summary>
        /// <param name="timeToWait">A <see cref="TimeSpan"/> structure defining the amount of time to wait.</param>
        /// <returns>A self reference</returns>
        /// <remarks>
        /// When searching for a single element, the driver should poll the page
        /// until the element has been found, or this timeout expires before throwing
        /// a <see cref="NoSuchElementException"/>. When searching for multiple elements,
        /// the driver should poll the page until at least one element has been found
        /// or this timeout has expired.
        /// <para>
        /// Increasing the implicit wait timeout should be used judiciously as it
        /// will have an adverse effect on test run time, especially when used with
        /// slower location strategies like XPath.
        /// </para>
        /// </remarks>
        [Obsolete("This method will be removed in a future version. Please set the ImplicitWait property instead.")]
        ITimeouts ImplicitlyWait(TimeSpan timeToWait);

        /// <summary>
        /// Specifies the amount of time the driver should wait when executing JavaScript asynchronously.
        /// </summary>
        /// <param name="timeToWait">A <see cref="TimeSpan"/> structure defining the amount of time to wait.
        /// Setting this parameter to <see cref="TimeSpan.MinValue"/> will allow the script to run indefinitely.</param>
        /// <returns>A self reference</returns>
        [Obsolete("This method will be removed in a future version. Please set the AsynchronousJavaScript property instead.")]
        ITimeouts SetScriptTimeout(TimeSpan timeToWait);

        /// <summary>
        /// Specifies the amount of time the driver should wait for a page to load when setting the <see cref="IWebDriver.Url"/> property.
        /// </summary>
        /// <param name="timeToWait">A <see cref="TimeSpan"/> structure defining the amount of time to wait.
        /// Setting this parameter to <see cref="TimeSpan.MinValue"/> will allow the page to load indefinitely.</param>
        /// <returns>A self reference</returns>
        [Obsolete("This method will be removed in a future version. Please set the PageLoad property instead.")]
        ITimeouts SetPageLoadTimeout(TimeSpan timeToWait);
    }
}
