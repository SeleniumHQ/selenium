// <copyright file="NetworkInterceptionTests.cs" company="Selenium Committers">
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
using OpenQA.Selenium.DevTools;
using System.Threading.Tasks;

namespace OpenQA.Selenium;

[TestFixture]
public class NetworkInterceptionTests : DriverTestFixture
{
    [TearDown]
    public void RemoveHandlers()
    {
        if (driver is IDevTools)
        {
            INetwork network = driver.Manage().Network;
            network.ClearAuthenticationHandlers();
            network.ClearRequestHandlers();
            network.ClearResponseHandlers();
        }
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Firefox does not implement the CDP Fetch domain required for network interception")]
    public async Task TestCanInterceptNetworkCalls()
    {
        if (driver is IDevTools)
        {
            INetwork network = driver.Manage().Network;
            NetworkResponseHandler handler = new NetworkResponseHandler();
            handler.ResponseMatcher = (responseData) => responseData.Url.Contains("simpleTest.html");
            handler.ResponseTransformer = (responseData) =>
            {
                responseData.Body = "<html><body><p>I intercepted you</p></body></html>";
                return responseData;
            };
            network.AddResponseHandler(handler);
            await network.StartMonitoring();
            driver.Url = simpleTestPage;
            string text = driver.FindElement(By.CssSelector("p")).Text;
            await network.StopMonitoring();
            Assert.That(text, Is.EqualTo("I intercepted you"));
        }
    }

    [Test]
    [IgnoreBrowser(Browser.Firefox, "Firefox does not implement the CDP Fetch domain required for network interception")]
    public async Task TestCanUseAuthorizationHandler()
    {
        if (driver is IDevTools)
        {
            INetwork network = driver.Manage().Network;
            NetworkAuthenticationHandler handler = new NetworkAuthenticationHandler()
            {
                UriMatcher = (uri) => uri.PathAndQuery.Contains("basicAuth"),
                Credentials = new PasswordCredentials("test", "test")
            };
            network.AddAuthenticationHandler(handler);
            await network.StartMonitoring();
            driver.Url = authenticationPage;
            string text = driver.FindElement(By.CssSelector("h1")).Text;
            await network.StopMonitoring();
            Assert.That(text, Is.EqualTo("authorized"));
        }
    }

    [Test]
    [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
    public async Task TransformNetworkResponse()
    {
        if (driver is IDevTools)
        {
            var handler = new NetworkResponseHandler()
            {
                ResponseMatcher = _ => true,
                ResponseTransformer = _ => new HttpResponseData
                {
                    StatusCode = 200,
                    Body = "Creamy, delicious cheese!"
                }
            };
            INetwork networkInterceptor = driver.Manage().Network;
            networkInterceptor.AddResponseHandler(handler);
            await networkInterceptor.StartMonitoring();

            driver.Navigate().GoToUrl("https://www.selenium.dev");
            await networkInterceptor.StopMonitoring();

            var body = driver.FindElement(By.TagName("body"));
            Assert.AreEqual("Creamy, delicious cheese!", body.Text);
        }
    }
}
