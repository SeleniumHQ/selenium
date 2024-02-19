// <copyright file="ObjectStateAssumptionsTest.cs" company="Selenium Committers">
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

using NUnit.Framework;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ObjectStateAssumptionsTest : DriverTestFixture
    {
        [Test]
        public void UninitializedWebDriverDoesNotThrowException()
        {
            variousMethodCallsToCheckAssumptions();
        }

        /**
        * This test case differs from @see testUninitializedWebDriverDoesNotThrowNPE as it initializes
        * WebDriver with an initial call to get(). It also should not fail.
        */
        [Test]
        public void InitializedWebDriverDoesNotThrowException()
        {
            driver.Url = simpleTestPage;
            variousMethodCallsToCheckAssumptions();
        }

        /**
        * Test the various options, again for an uninitialized driver, NPEs are thrown.
        */
        [Test]
        public void OptionsForUninitializedWebDriverDoesNotThrowException()
        {
            IOptions options = driver.Manage();
            ReadOnlyCollection<Cookie> allCookies = options.Cookies.AllCookies;
        }

        /**
        * Add the various method calls you want to try here...
        */
        private void variousMethodCallsToCheckAssumptions()
        {
            string currentUrl = driver.Url;
            string currentTitle = driver.Title;
            string pageSource = driver.PageSource;
            By byHtml = By.XPath("//html");
            driver.FindElement(byHtml);
            driver.FindElements(byHtml);
        }
    }
}
