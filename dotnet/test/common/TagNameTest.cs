using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class TagNameTest : DriverTestFixture
    {
        [Test]
        public void ShouldReturnInput()
        {
            driver.Url = formsPage;
            IWebElement selectBox = driver.FindElement(By.Id("cheese"));
            Assert.AreEqual(selectBox.TagName.ToLower(), "input");
        }
    }
}
