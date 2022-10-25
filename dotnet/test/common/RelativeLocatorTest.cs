using NUnit.Framework;
using System.Collections.ObjectModel;
using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Environment;
using System.Collections.Generic;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class RelativeLocatorTest : DriverTestFixture
    {
        [Test]
        public void ShouldBeAbleToFindElementsAboveAnother()
        {
            driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

            IWebElement lowest = driver.FindElement(By.Id("below"));

            ReadOnlyCollection<IWebElement> elements = driver.FindElements(RelativeBy.WithLocator(By.TagName("p")).Above(lowest));
            List<string> elementIds = new List<string>();
            foreach (IWebElement element in elements)
            {
                string id = element.GetAttribute("id");
                elementIds.Add(id);
            }

            Assert.That(elementIds, Is.EquivalentTo(new List<string>() { "above", "mid" }));
        }

        [Test]
        public void ShouldBeAbleToCombineFilters()
        {
            driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

            ReadOnlyCollection<IWebElement> seen = driver.FindElements(RelativeBy.WithLocator(By.TagName("td")).Above(By.Id("center")).RightOf(By.Id("second")));

            List<string> elementIds = new List<string>();
            foreach (IWebElement element in seen)
            {
                string id = element.GetAttribute("id");
                elementIds.Add(id);
            }

            Assert.That(elementIds, Is.EquivalentTo(new List<string>() { "third" }));
        }
    }
}
