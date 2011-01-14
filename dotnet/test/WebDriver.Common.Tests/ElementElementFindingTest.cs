using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;
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
            Assert.AreEqual("inside", child.Text);
        }

        [Test]
        public void ShouldFindElementByLinkText()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("div1"));
            IWebElement child = parent.FindElement(By.PartialLinkText("hello world"));
            Assert.AreEqual("hello world", child.Text);
        }

        [Test]
        public void ShouldFindElementByName()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("div1"));
            IWebElement child = parent.FindElement(By.Name("link1"));
            Assert.AreEqual("hello world", child.Text);
        }

        [Test]
        public void ShouldFindElementByXPath()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Id("test_id_div"));
            IWebElement child = parent.FindElement(By.XPath("p"));
            Assert.AreEqual("inside", child.Text);
        }

        [Test]
        public void ShouldFindElementByClassName()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("classes"));
            IWebElement child = parent.FindElement(By.ClassName("oneother"));
            Assert.AreEqual("But not me", child.Text);            
        }

        [Test]
        public void ShouldFindElementByPartialLinkText()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("div1"));
            IWebElement child = parent.FindElement(By.PartialLinkText(" world"));
            Assert.AreEqual("hello world", child.Text);
        }

        [Test]
        public void ShouldFindElementByTagName()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Id("test_id_div"));
            IWebElement child = parent.FindElement(By.TagName("p"));
            Assert.AreEqual("inside", child.Text);
        }
        #endregion

        #region FindElemements Tests

        [Test]
        public void ShouldFindElementsById()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("form2"));
            ReadOnlyCollection<IWebElement> children = parent.FindElements(By.Id("2"));
            Assert.AreEqual(2, children.Count);
        }

        [Test]
        public void ShouldFindElementsByLinkText()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("div1"));
            ReadOnlyCollection<IWebElement> children = parent.FindElements(By.PartialLinkText("hello world"));
            Assert.AreEqual(2, children.Count);
            Assert.AreEqual("hello world", children[0].Text);
            Assert.AreEqual("hello world", children[1].Text);
        }

        [Test]
        public void ShouldFindElementsByName()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("form2"));
            ReadOnlyCollection<IWebElement> children = parent.FindElements(By.Name("selectomatic"));
            Assert.AreEqual(2, children.Count);
        }

        [Test]
        public void ShouldFindElementsByXPath()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("classes"));
            ReadOnlyCollection<IWebElement> children = parent.FindElements(By.XPath("span"));
            Assert.AreEqual(3, children.Count);
            //TODO(andre.nogueira): Is the ordering garanteed?
            Assert.AreEqual("Find me", children[0].Text);
            Assert.AreEqual("Also me", children[1].Text);
            Assert.AreEqual("But not me", children[2].Text);
        }

        [Test]
        public void ShouldFindElementsByClassName()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("classes"));
            ReadOnlyCollection<IWebElement> children = parent.FindElements(By.ClassName("one"));
            Assert.AreEqual(2, children.Count);
            //TODO(andre.nogueira): Is the ordering garanteed?
            Assert.AreEqual("Find me", children[0].Text);
            Assert.AreEqual("Also me", children[1].Text);
        }

        [Test]
        public void ShouldFindElementsByPartialLinkText()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("div1"));
            ReadOnlyCollection<IWebElement> children = parent.FindElements(By.PartialLinkText("hello "));
            Assert.AreEqual(2, children.Count);
            Assert.AreEqual("hello world", children[0].Text);
            Assert.AreEqual("hello world", children[1].Text);
        }

        [Test]
        public void ShouldFindElementsByTagName()
        {
            driver.Url = nestedPage;
            IWebElement parent = driver.FindElement(By.Name("classes"));
            ReadOnlyCollection<IWebElement> children = parent.FindElements(By.TagName("span"));
            Assert.AreEqual(3, children.Count);
            //TODO(andre.nogueira): Is the ordering garanteed?
            Assert.AreEqual("Find me", children[0].Text);
            Assert.AreEqual("Also me", children[1].Text);
            Assert.AreEqual("But not me", children[2].Text);
        }

        #endregion
    }
}
