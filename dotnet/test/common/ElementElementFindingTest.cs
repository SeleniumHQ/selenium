using NUnit.Framework;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    // TODO(andre.nogueira): Find better name. This class is to distinguish 
    // finding elements in the driver (whole page), and inside other elements
    [TestFixture]
    public class ElementElementFindingTest : DriverTestFixture
    {
        #region FindElemement Tests

        [Test]
        public void ShouldFindElementById()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Id("test_id_div"));
            IWebElement child = parent.FindElement(By.Id("test_id"));
            Assert.That(child.Text, Is.EqualTo("inside"));
        }

        [Test]
        public void ShouldFindElementByLinkText()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("div1"));
            IWebElement child = parent.FindElement(By.PartialLinkText("hello world"));
            Assert.That(child.Text, Is.EqualTo("hello world"));
        }

        [Test]
        public void ShouldFindElementByName()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("div1"));
            IWebElement child = parent.FindElement(By.Name("link1"));
            Assert.That(child.Text, Is.EqualTo("hello world"));
        }

        [Test]
        public void ShouldFindElementByXPath()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Id("test_id_div"));
            IWebElement child = parent.FindElement(By.XPath("p"));
            Assert.That(child.Text, Is.EqualTo("inside"));
        }

        [Test]
        public void ShouldFindElementByClassName()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("classes"));
            IWebElement child = parent.FindElement(By.ClassName("oneother"));
            Assert.That(child.Text, Is.EqualTo("But not me"));
        }

        [Test]
        public void ShouldFindElementByPartialLinkText()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("div1"));
            IWebElement child = parent.FindElement(By.PartialLinkText(" world"));
            Assert.That(child.Text, Is.EqualTo("hello world"));
        }

        [Test]
        public void ShouldFindElementByTagName()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Id("test_id_div"));
            IWebElement child = parent.FindElement(By.TagName("p"));
            Assert.That(child.Text, Is.EqualTo("inside"));
        }
        #endregion

        #region FindElemements Tests

        [Test]
        public void ShouldFindElementsById()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("form2"));
            ReadOnlyCollection<IWebElement> children = parent.FindElements(By.Id("2"));
            Assert.That(children.Count, Is.EqualTo(2));
        }

        [Test]
        public void ShouldFindElementsByLinkText()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("div1"));
            ReadOnlyCollection<IWebElement> children = parent.FindElements(By.PartialLinkText("hello world"));
            Assert.That(children.Count, Is.EqualTo(2));
            Assert.That(children[0].Text, Is.EqualTo("hello world"));
            Assert.That(children[1].Text, Is.EqualTo("hello world"));
        }

        [Test]
        public void ShouldFindElementsByName()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("form2"));
            ReadOnlyCollection<IWebElement> children = parent.FindElements(By.Name("selectomatic"));
            Assert.That(children.Count, Is.EqualTo(2));
        }

        [Test]
        public void ShouldFindElementsByXPath()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("classes"));
            ReadOnlyCollection<IWebElement> children = parent.FindElements(By.XPath("span"));
            Assert.That(children.Count, Is.EqualTo(3));
            Assert.That(children[0].Text, Is.EqualTo("Find me"));
            Assert.That(children[1].Text, Is.EqualTo("Also me"));
            Assert.That(children[2].Text, Is.EqualTo("But not me"));
        }

        [Test]
        public void ShouldFindElementsByClassName()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("classes"));
            ReadOnlyCollection<IWebElement> children = parent.FindElements(By.ClassName("one"));
            Assert.That(children.Count, Is.EqualTo(2));
            Assert.That(children[0].Text, Is.EqualTo("Find me"));
            Assert.That(children[1].Text, Is.EqualTo("Also me"));
        }

        [Test]
        public void ShouldFindElementsByPartialLinkText()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("div1"));
            ReadOnlyCollection<IWebElement> children = parent.FindElements(By.PartialLinkText("hello "));
            Assert.That(children.Count, Is.EqualTo(2));
            Assert.That(children[0].Text, Is.EqualTo("hello world"));
            Assert.That(children[1].Text, Is.EqualTo("hello world"));
        }

        [Test]
        public void ShouldFindElementsByTagName()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("classes"));
            ReadOnlyCollection<IWebElement> children = parent.FindElements(By.TagName("span"));
            Assert.That(children.Count, Is.EqualTo(3));
            Assert.That(children[0].Text, Is.EqualTo("Find me"));
            Assert.That(children[1].Text, Is.EqualTo("Also me"));
            Assert.That(children[2].Text, Is.EqualTo("But not me"));
        }

        #endregion
    }
}
