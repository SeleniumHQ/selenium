// <copyright file="MSEdgeDriver.cs" company="WebDriver Committers">
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
using OpenQA.Selenium.Remote;
using OpenQA.Selenium.Chrome;

namespace OpenQA.Selenium.MSEdge
{
    /// <summary>
    /// Provides a mechanism to write tests against MicrosoftEdge
    /// </summary>
    /// <example>
    /// <code>
    /// [TestFixture]
    /// public class Testing
    /// {
    ///     private IWebDriver driver;
    ///     <para></para>
    ///     [SetUp]
    ///     public void SetUp()
    ///     {
    ///         driver = new MSEdgeDriver();
    ///     }
    ///     <para></para>
    ///     [Test]
    ///     public void TestBing()
    ///     {
    ///         driver.Navigate().GoToUrl("http://www.bing.com");
    ///         /*
    ///         *   Rest of the test
    ///         */
    ///     }
    ///     <para></para>
    ///     [TearDown]
    ///     public void TearDown()
    ///     {
    ///         driver.Quit();
    ///     }
    /// }
    /// </code>
    /// </example>
    public class MSEdgeDriver : ChromeDriver
    {
        public MSEdgeDriver() : this(new MSEdgeOptions())
        {
        }

        public MSEdgeDriver(MSEdgeOptions options) : this(MSEdgeDriverService.CreateDefaultService(), options, RemoteWebDriver.DefaultCommandTimeout)
        {
        }

        public MSEdgeDriver(MSEdgeDriverService service) : this(service, new MSEdgeOptions())
        {
        }

        public MSEdgeDriver(string msEdgeDriverDirectory) : this(msEdgeDriverDirectory, new MSEdgeOptions())
        {

        }

        public MSEdgeDriver(string msEdgeDriverDirectory, MSEdgeOptions options) : this(msEdgeDriverDirectory, options, RemoteWebDriver.DefaultCommandTimeout)
        {

        }

        public MSEdgeDriver(string msEdgeDriverDirectory, MSEdgeOptions options, TimeSpan commandTimeout) : this(MSEdgeDriverService.CreateDefaultService(msEdgeDriverDirectory), options, commandTimeout)
        {
        }

        public MSEdgeDriver(MSEdgeDriverService service, MSEdgeOptions options) : this(service, options, RemoteWebDriver.DefaultCommandTimeout)
        {

        }

        public MSEdgeDriver(MSEdgeDriverService service, MSEdgeOptions options, TimeSpan commandTimeout) : base(service, options, commandTimeout)
        {

        }
    }
}
