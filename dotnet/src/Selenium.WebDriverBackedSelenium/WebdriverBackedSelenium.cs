// <copyright file="WebDriverBackedSelenium.cs" company="WebDriver Committers">
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
using OpenQA.Selenium;

namespace Selenium
{
    /// <summary>
    /// Provides a Selenium instance that processes its commands via an IWebDriver instance.
    /// </summary>
    public class WebDriverBackedSelenium : DefaultSelenium
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="WebDriverBackedSelenium"/> class using the specified
        /// WebDriver driver and base URL.
        /// </summary>
        /// <param name="baseDriver">The <see cref="IWebDriver"/> instance used to drive the browser.</param>
        /// <param name="baseUrl">The base URL of the Selenium server.</param>
        public WebDriverBackedSelenium(IWebDriver baseDriver, string baseUrl) :
            this(baseDriver, new Uri(baseUrl))
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="WebDriverBackedSelenium"/> class using the specified
        /// WebDriver driver and base URL.
        /// </summary>
        /// <param name="baseDriver">The <see cref="IWebDriver"/> instance used to drive the browser.</param>
        /// <param name="baseUrl">The base URL of the Selenium server.</param>
        public WebDriverBackedSelenium(IWebDriver baseDriver, Uri baseUrl) : 
            base(new WebDriverCommandProcessor(baseUrl, baseDriver)) 
        {
        }
        
        /// <summary>
        /// Gets the underlying <see cref="IWebDriver"/> object used to drive the browser for this instance of Selenium.
        /// </summary>
        public IWebDriver UnderlyingWebDriver
        {
            get { return ((WebDriverCommandProcessor)commandProcessor).UnderlyingWebDriver; }
        }
    }
}
