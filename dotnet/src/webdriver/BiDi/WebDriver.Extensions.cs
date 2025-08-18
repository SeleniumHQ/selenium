// <copyright file="WebDriver.Extensions.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using System;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi;

public static class WebDriverExtensions
{
    public static async Task<BiDi> AsBiDiAsync(this IWebDriver webDriver, BiDiOptions? options = null)
    {
        if (webDriver is null) throw new ArgumentNullException(nameof(webDriver));

        string? webSocketUrl = null;

        if (webDriver is IHasCapabilities hasCapabilities)
        {
            webSocketUrl = hasCapabilities.Capabilities.GetCapability("webSocketUrl")?.ToString();
        }

        if (webSocketUrl is null) throw new BiDiException("The driver is not compatible with bidirectional protocol or \"webSocketUrl\" not enabled in driver options.");

        var bidi = await BiDi.ConnectAsync(webSocketUrl, options).ConfigureAwait(false);

        return bidi;
    }
}
