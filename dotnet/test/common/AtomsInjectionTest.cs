using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class AtomsInjectionTest : DriverTestFixture
    {
        [Test]
        public void InjectingAtomShouldNotTrampleOnUnderscoreGlobal()
        {
            driver.Url = underscorePage;
            driver.FindElement(By.TagName("body"));
            Assert.AreEqual("123", ((IJavaScriptExecutor)driver).ExecuteScript("return _.join('');"));
        }
    }
}
