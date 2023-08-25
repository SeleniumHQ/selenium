using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NUnit.Framework;
using OpenQA.Selenium.DevTools;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class NetworkInterceptionTests : DriverTestFixture
    {
        [Test]
        public void TestCanInterceptNetworkCalls()
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
                network.StartMonitoring();
                driver.Url = simpleTestPage;
                string text = driver.FindElement(By.CssSelector("p")).Text;
                network.StopMonitoring();
                Assert.AreEqual("I intercepted you", text);
            }
        }
    }
}
