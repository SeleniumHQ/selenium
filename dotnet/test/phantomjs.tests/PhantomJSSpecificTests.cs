using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium.PhantomJS
{
    [TestFixture]
    public class PhantomJSSpecificTests : DriverTestFixture
    {
        [Test]
        public void ShouldBeAbleToReturnResultsFromScriptExecutedInPhantomJSContext()
        {
            if (!(driver is PhantomJSDriver))
            {
                // Skip this test if not using PhantomJS.
                // The command under test is only available when using PhantomJS
                return;
            }

            PhantomJSDriver phantom = (PhantomJSDriver)driver;

            // Do we get results back?
            object result = phantom.ExecutePhantomJS("return 1 + 1");
            Assert.AreEqual(2L, (long)result);
        }

        [Test]
        public void ShouldBeAbleToReadArgumentsInScriptExecutedInPhantomJSContext()
        {
            if (!(driver is PhantomJSDriver))
            {
                // Skip this test if not using PhantomJS.
                // The command under test is only available when using PhantomJS
                return;
            }

            PhantomJSDriver phantom = (PhantomJSDriver)driver;

            // Can we read arguments?
            object result = phantom.ExecutePhantomJS("return arguments[0] + arguments[0]", 1L);
            Assert.AreEqual(2L, (long)result);
        }

        [Test]
        public void ShouldBeAbleToOverrideScriptInPageFromPhantomJSContext()
        {
            if (!(driver is PhantomJSDriver))
            {
                // Skip this test if not using PhantomJS.
                // The command under test is only available when using PhantomJS
                return;
            }

            PhantomJSDriver phantom = (PhantomJSDriver)driver;

            // Can we override some browser JavaScript functions in the page context?
            object result = phantom.ExecutePhantomJS("var page = this;" +
               "page.onInitialized = function () { " +
                    "page.evaluate(function () { " +
                        "Math.random = function() { return 42 / 100 } " +
                    "})" +
                "}");

            phantom.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("injectableContent.html");
            IWebElement numbers = phantom.FindElement(By.Id("numbers"));
            bool foundAtLeastOne = false;
            foreach (string number in numbers.Text.Split(' '))
            {
                foundAtLeastOne = true;
                Assert.AreEqual("42", number);
            }

            Assert.IsTrue(foundAtLeastOne);
        }
    }
}

