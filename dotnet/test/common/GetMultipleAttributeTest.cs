using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class GetMultipleAttributeTest : DriverTestFixture
    {
        [Test]
        public void MultipleAttributeShouldBeNullWhenNotSet()
        {
            driver.Url = selectPage;
            IWebElement element = driver.FindElement(By.Id("selectWithoutMultiple"));
            Assert.That(element.GetAttribute("multiple"), Is.Null);
        }

        [Test]
        public void MultipleAttributeShouldBeTrueWhenSet()
        {
            driver.Url = selectPage;
            IWebElement element = driver.FindElement(By.Id("selectWithMultipleEqualsMultiple"));
            Assert.AreEqual("true", element.GetAttribute("multiple"));
        }

        [Test]
        public void MultipleAttributeShouldBeTrueWhenSelectHasMutilpeWithValueAsBlank()
        {
            driver.Url = selectPage;
            IWebElement element = driver.FindElement(By.Id("selectWithEmptyStringMultiple"));
            Assert.AreEqual("true", element.GetAttribute("multiple"));
        }

        [Test]
        public void MultipleAttributeShouldBeTrueWhenSelectHasMutilpeWithoutAValue()
        {
            driver.Url = selectPage;
            IWebElement element = driver.FindElement(By.Id("selectWithMultipleWithoutValue"));
            Assert.AreEqual("true", element.GetAttribute("multiple"));
        }

        [Test]
        public void MultipleAttributeShouldBeTrueWhenSelectHasMutilpeWithValueAsSomethingElse()
        {
            driver.Url = selectPage;
            IWebElement element = driver.FindElement(By.Id("selectWithRandomMultipleValue"));
            Assert.AreEqual("true", element.GetAttribute("multiple"));
        }
    }
}
