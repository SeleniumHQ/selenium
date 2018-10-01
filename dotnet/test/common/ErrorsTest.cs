using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ErrorsTest : DriverTestFixture
    {
        /// <summary>
        /// Regression test for Selenium RC issue 363.
        /// http://code.google.com/p/selenium/issues/detail?id=363
        /// This will trivially pass on browsers that do not support the onerror
        /// handler (e.g. Internet Explorer).
        /// </summary>
        [Test]
        public void ShouldNotGenerateErrorsWhenOpeningANewPage()
        {
            driver.Url = errorsPage;
            object result = ((IJavaScriptExecutor)driver).ExecuteScript("return window.ERRORS.join('\\n');");
            Assert.AreEqual("", result, "Should have no errors");
        }

    }
}
