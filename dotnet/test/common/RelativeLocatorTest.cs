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
        public void WithId()
        {
            driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

            IWebElement highest = driver.FindElement(By.Id("center"));
            IWebElement foundBelow = driver.FindElement(RelativeBy.WithId("eighth").Below(highest));

            var id = foundBelow.GetAttribute("id");
            Assert.That(id == "eighth");
        }

        [Test]
        public void WithCssSelector()
        {
            driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

            IWebElement highest = driver.FindElement(By.Id("center"));
            IWebElement foundBelow = driver.FindElement(RelativeBy.WithCssSelector("#eighth").Below(highest));

            var id = foundBelow.GetAttribute("id");
            Assert.That(id == "eighth");
        }

        [Test]
        public void WithXPath()
        {
            driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

            IWebElement highest = driver.FindElement(By.Id("center"));
            IWebElement foundBelow = driver.FindElement(RelativeBy.WithXPath("//td").Below(highest).RightOf(By.Id("seventh")));

            var id = foundBelow.GetAttribute("id");
            Assert.AreEqual("eighth", id);
        }

        [Test]
        public void WithName()
        {
            driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

            IWebElement highest = driver.FindElement(By.Id("highestLink"));
            IWebElement foundBelow = driver.FindElement(RelativeBy.WithName("secondLink").Below(highest));

            var id = foundBelow.GetAttribute("id");
            Assert.That(id == "middleLink");
        }

        [Test]
        public void WithLinkText()
        {
            driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

            IWebElement highest = driver.FindElement(By.Id("highestLink"));
            IWebElement foundBelow = driver.FindElement(RelativeBy.WithLinkText("Two").Below(highest));

            Assert.That(foundBelow.Displayed);
        }

        [Test]
        public void WithPartialLinkText()
        {
            driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

            IWebElement highest = driver.FindElement(By.Id("highestLink"));
            IWebElement foundBelow = driver.FindElement(RelativeBy.WithPartialLinkText("Thre").Below(highest));

            Assert.That(foundBelow.Displayed);
        }

        [Test]
        public void ShouldBeAbleToFindElementsBelowAnother()
        {
            driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

            IWebElement highest = driver.FindElement(By.Id("above"));

            ReadOnlyCollection<IWebElement> elements = driver.FindElements(RelativeBy.WithClassName("identify").Below(highest));
            List<string> elementIds = new List<string>();
            foreach (IWebElement element in elements)
            {
                string id = element.GetAttribute("id");
                elementIds.Add(id);
            }

            Assert.That(elementIds, Is.EquivalentTo(new List<string>() { "below", "mid" }));
        }

        [Test]
        public void ShouldBeAbleToFindElementsAboveAnother()
        {
            driver.Url = (EnvironmentManager.Instance.UrlBuilder.WhereIs("relative_locators.html"));

            IWebElement lowest = driver.FindElement(By.Id("below"));

            ReadOnlyCollection<IWebElement> elements = driver.FindElements(RelativeBy.WithTagName("p").Above(lowest));
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

            ReadOnlyCollection<IWebElement> seen = driver.FindElements(RelativeBy.WithTagName("td").Above(By.Id("center")).RightOf(By.Id("second")));

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
