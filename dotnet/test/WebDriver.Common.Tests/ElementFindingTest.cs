using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using System.Collections.ObjectModel;
using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ElementFindingTest : DriverTestFixture
    {
        [Test]
        public void ShouldReturnTitleOfPageIfSet()
        {
            driver.Url = xhtmlTestPage;
            Assert.AreEqual(driver.Title, "XHTML Test Page");

            driver.Url = simpleTestPage;
            Assert.AreEqual(driver.Title, "Hello WebDriver");
        }

        [Test]
        [ExpectedException(typeof(NoSuchElementException))]
        public void ShouldNotBeAbleToLocateASingleElementThatDoesNotExist()
        {
            driver.Url = formsPage;

            driver.FindElement(By.Id("nonExistantButton"));
        }

        [Test]
        public void ShouldBeAbleToClickOnLinkIdentifiedByText()
        {
            driver.Url = xhtmlTestPage;
            driver.FindElement(By.LinkText("click me")).Click();
            WaitFor(() => { return driver.Title == "We Arrive Here"; });
            Assert.AreEqual(driver.Title, "We Arrive Here");
        }

        [Test]
        public void DriverShouldBeAbleToFindElementsAfterLoadingMoreThanOnePageAtATime()
        {
            driver.Url = formsPage;
            driver.Url = xhtmlTestPage;
            driver.FindElement(By.LinkText("click me")).Click();
            WaitFor(() => { return driver.Title == "We Arrive Here"; });
            Assert.AreEqual(driver.Title, "We Arrive Here");
        }

        [Test]
        public void ShouldBeAbleToClickOnLinkIdentifiedById()
        {
            driver.Url = xhtmlTestPage;
            driver.FindElement(By.Id("linkId")).Click();
            WaitFor(() => { return driver.Title == "We Arrive Here"; });
            Assert.AreEqual(driver.Title, "We Arrive Here");
        }

        [Test]
        [ExpectedException(typeof(NoSuchElementException))]
        public void ShouldThrowAnExceptionWhenThereIsNoLinkToClickAndItIsFoundWithLinkText()
        {
            driver.Url = xhtmlTestPage;

            driver.FindElement(By.LinkText("Not here either"));
        }

        [Test]
        public void ShouldFindAnElementBasedOnId()
        {
            driver.Url = formsPage;

            IWebElement element = driver.FindElement(By.Id("checky"));

            Assert.IsFalse(element.Selected);
        }

        [Test]
        [ExpectedException(typeof(NoSuchElementException))]
        public void ShouldNotBeAbleToFindElementsBasedOnIdIfTheElementIsNotThere()
        {
            driver.Url = formsPage;

            driver.FindElement(By.Id("notThere"));
        }

        [Test]
        public void ShouldBeAbleToFindChildrenOfANode()
        {
            driver.Url = selectableItemsPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.XPath("/html/head"));
            IWebElement head = elements[0];
            ReadOnlyCollection<IWebElement> importedScripts = head.FindElements(By.TagName("script"));
            Assert.AreEqual(importedScripts.Count, 3);
        }

        [Test]
        public void ReturnAnEmptyListWhenThereAreNoChildrenOfANode()
        {
            driver.Url = xhtmlTestPage;
            IWebElement table = driver.FindElement(By.Id("table"));
            ReadOnlyCollection<IWebElement> rows = table.FindElements(By.TagName("tr"));

            Assert.AreEqual(rows.Count, 0);
        }

        [Test]
        public void ShouldFindElementsByName()
        {
            driver.Url = formsPage;

            IWebElement element = driver.FindElement(By.Name("checky"));

            Assert.AreEqual(element.GetAttribute("value"), "furrfu");
        }

        [Test]
        public void ShouldFindElementsByClass()
        {
            driver.Url = xhtmlTestPage;

            IWebElement element = driver.FindElement(By.ClassName("extraDiv"));
            Assert.IsTrue(element.Text.StartsWith("Another div starts here."));
        }

        [Test]
        public void ShouldFindElementsByClassWhenItIsTheFirstNameAmongMany()
        {
            driver.Url = xhtmlTestPage;

            IWebElement element = driver.FindElement(By.ClassName("nameA"));
            Assert.AreEqual(element.Text, "An H2 title");
        }

        [Test]
        public void ShouldFindElementsByClassWhenItIsTheLastNameAmongMany()
        {
            driver.Url = xhtmlTestPage;

            IWebElement element = driver.FindElement(By.ClassName("nameC"));
            Assert.AreEqual(element.Text, "An H2 title");
        }

        [Test]
        public void ShouldFindElementsByClassWhenItIsInTheMiddleAmongMany()
        {
            driver.Url = xhtmlTestPage;

            IWebElement element = driver.FindElement(By.ClassName("nameBnoise"));
            Assert.AreEqual(element.Text, "An H2 title");
        }

        [Test]
        public void ShouldFindElementByClassWhenItsNameIsSurroundedByWhitespace()
        {
            driver.Url = xhtmlTestPage;

            IWebElement element = driver.FindElement(By.ClassName("spaceAround"));
            Assert.AreEqual("Spaced out", element.Text);
        }

        [Test]
        public void ShouldFindElementsByClassWhenItsNameIsSurroundedByWhitespace()
        {
            driver.Url = xhtmlTestPage;

            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.ClassName("spaceAround"));
            Assert.AreEqual(1, elements.Count);
            Assert.AreEqual("Spaced out", elements[0].Text);
        }

        [Test]
        [ExpectedException(typeof(NoSuchElementException))]
        public void ShouldNotFindElementsByClassWhenTheNameQueriedIsShorterThanCandidateName()
        {
            driver.Url = xhtmlTestPage;

            driver.FindElement(By.ClassName("nameB"));
        }

        [Test]
        public void ShouldBeAbleToFindMultipleElementsByXPath()
        {
            driver.Url = xhtmlTestPage;

            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.XPath("//div"));

            Assert.IsTrue(elements.Count > 1);
        }

        [Test]
        public void ShouldBeAbleToFindMultipleElementsByLinkText()
        {
            driver.Url = xhtmlTestPage;

            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.LinkText("click me"));

            Assert.IsTrue(elements.Count == 2, "Expected 2 links, got " + elements.Count);
        }

        [Test]
        public void ShouldBeAbleToFindMultipleElementsByPartialLinkText()
        {
            driver.Url = xhtmlTestPage;

            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.PartialLinkText("ick me"));

            Assert.IsTrue(elements.Count == 2);
        }

        [Test]
        public void ShouldBeAbleToFindElementByPartialLinkText()
        {
            driver.Url = xhtmlTestPage;

            driver.FindElement(By.PartialLinkText("anon"));
        }

        [Test]
        public void ShouldFindElementByLinkTextContainingEqualsSign()
        {
            driver.Url = xhtmlTestPage;
            IWebElement element = driver.FindElement(By.LinkText("Link=equalssign"));
            Assert.AreEqual("linkWithEqualsSign", element.GetAttribute("id"));
        }

        [Test]
        public void ShouldFindElementByPartialLinkTextContainingEqualsSign()
        {
            driver.Url = xhtmlTestPage;
            IWebElement element = driver.FindElement(By.PartialLinkText("Link="));
            Assert.AreEqual("linkWithEqualsSign", element.GetAttribute("id"));
        }

        [Test]
        public void ShouldFindElementsByLinkTextContainingEqualsSign()
        {
            driver.Url = xhtmlTestPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.LinkText("Link=equalssign"));
            Assert.AreEqual(1, elements.Count);
            Assert.AreEqual("linkWithEqualsSign", elements[0].GetAttribute("id"));
        }

        [Test]
        public void ShouldFindElementsByPartialLinkTextContainingEqualsSign()
        {
            driver.Url = xhtmlTestPage;
            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.PartialLinkText("Link="));
            Assert.AreEqual(1, elements.Count);
            Assert.AreEqual("linkWithEqualsSign", elements[0].GetAttribute("id"));
        }

        [Test]
        public void ShouldBeAbleToFindMultipleElementsByName()
        {
            driver.Url = nestedPage;

            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.Name("checky"));

            Assert.IsTrue(elements.Count > 1);
        }

        [Test]
        public void ShouldBeAbleToFindMultipleElementsById()
        {
            driver.Url = nestedPage;

            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.Id("2"));

            Assert.AreEqual(8, elements.Count);
        }

        [Test]
        public void ShouldBeAbleToFindMultipleElementsByClassName()
        {
            driver.Url = xhtmlTestPage;

            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.ClassName("nameC"));

            Assert.IsTrue(elements.Count > 1);
        }

        [Test]
        // You don't want to ask why this is here
        public void WhenFindingByNameShouldNotReturnById()
        {
            driver.Url = formsPage;

            IWebElement element = driver.FindElement(By.Name("id-name1"));
            Assert.AreEqual(element.GetAttribute("value"), "name");

            element = driver.FindElement(By.Id("id-name1"));
            Assert.AreEqual(element.GetAttribute("value"), "id");

            element = driver.FindElement(By.Name("id-name2"));
            Assert.AreEqual(element.GetAttribute("value"), "name");

            element = driver.FindElement(By.Id("id-name2"));
            Assert.AreEqual(element.GetAttribute("value"), "id");
        }

        [Test]
        public void ShouldFindGrandChildren()
        {
            driver.Url = formsPage;
            IWebElement form = driver.FindElement(By.Id("nested_form"));
            form.FindElement(By.Name("x"));
        }

        [Test]
        [ExpectedException(typeof(NoSuchElementException))]
        public void ShouldNotFindElementOutSideTree()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.Name("login"));
            element.FindElement(By.Name("x"));
        }

        [Test]
        public void ShouldReturnElementsThatDoNotSupportTheNameProperty()
        {
            driver.Url = nestedPage;

            driver.FindElement(By.Name("div1"));
            // If this works, we're all good
        }

        [Test]
        public void ShouldFindHiddenElementsByName()
        {
            driver.Url = formsPage;

            driver.FindElement(By.Name("hidden"));
        }

        [Test]
        public void ShouldFindAnElementBasedOnTagName()
        {
            driver.Url = formsPage;

            IWebElement element = driver.FindElement(By.TagName("input"));

            Assert.IsNotNull(element);
        }

        [Test]
        public void ShouldFindElementsBasedOnTagName()
        {
            driver.Url = formsPage;

            ReadOnlyCollection<IWebElement> elements = driver.FindElements(By.TagName("input"));

            Assert.IsNotNull(elements);
        }

        [Test]
        [ExpectedException(typeof(IllegalLocatorException))]
        public void FindingElementByCompoundClassNameIsAnError()
        {
            driver.Url = xhtmlTestPage;

            driver.FindElement(By.ClassName("a b"));
        }

        [Test]
        [ExpectedException(typeof(IllegalLocatorException))]
        public void FindingElementCollectionByCompoundClassNameIsAnError()
        {
            driver.FindElements(By.ClassName("a b"));
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToClickOnLinksWithNoHrefAttribute()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.LinkText("No href"));
            element.Click();

            // if any exception is thrown, we won't get this far. Sanity check
            Assert.AreEqual("Changed", driver.Title);
        }

        [Test]
        [ExpectedException(typeof(NoSuchElementException))]
        public void ShouldNotBeAbleToFindAnElementOnABlankPage()
        {
            driver.Url = "about:blank";
            driver.FindElement(By.TagName("a"));
        }

        [Test]
        [NeedsFreshDriver(BeforeTest = true)]
        [ExpectedException(typeof(NoSuchElementException))]
        public void ShouldNotBeAbleToLocateASingleElementOnABlankPage()
        {
            // Note we're on the default start page for the browser at this point.
            driver.FindElement(By.Id("nonExistantButton"));
        }

        [Test]
        [Category("Javascript")]
        [ExpectedException(typeof(StaleElementReferenceException))]
        public void RemovingAnElementDynamicallyFromTheDomShouldCauseAStaleRefException()
        {
            driver.Url = javascriptPage;

            IWebElement toBeDeleted = driver.FindElement(By.Id("deleted"));
            Assert.IsTrue(toBeDeleted.Displayed);

            driver.FindElement(By.Id("delete")).Click();
            driver.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromMilliseconds(500));
            bool displayedAfterDelete = toBeDeleted.Displayed;
        }

        [Test]
        public void FindingALinkByXpathUsingContainsKeywordShouldWork()
        {
            driver.Url = nestedPage;

            driver.FindElement(By.XPath("//a[contains(.,'hello world')]"));
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToFindAnElementByCssSelector()
        {
            if (!SupportsSelectorApi())
            {
                Assert.Ignore("Skipping test: selector API not supported");
            }

            driver.Url = xhtmlTestPage;

            driver.FindElement(By.CssSelector("div.content"));
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToFindAnElementsByCssSelector()
        {
            if (!SupportsSelectorApi())
            {
                Assert.Ignore("Skipping test: selector API not supported");
            }

            driver.Url = xhtmlTestPage;

            driver.FindElements(By.CssSelector("p"));
        }

        [Test]
        public void FindingByXPathShouldNotIncludeParentElementIfSameTagType()
        {
            driver.Url = xhtmlTestPage;
            IWebElement parent = driver.FindElement(By.Id("my_span"));

            Assert.AreEqual(2, parent.FindElements(By.TagName("div")).Count);
            Assert.AreEqual(2, parent.FindElements(By.TagName("span")).Count);
        }

        [Test]
        [ExpectedException(typeof(StaleElementReferenceException))]
        public void AnElementFoundInADifferentFrameIsStale()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("missedJsReference.html");
            driver.SwitchTo().Frame("inner");
            IWebElement element = driver.FindElement(By.Id("oneline"));
            driver.SwitchTo().DefaultContent();
            string text = element.Text;
        }

        [Test]
        [Category("JavaScript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.Opera)]
        public void AnElementFoundInADifferentFrameViaJsCanBeUsed()
        {
            String url = EnvironmentManager.Instance.UrlBuilder.WhereIs("missedJsReference.html");
            driver.Url = url;

            try
            {
                driver.SwitchTo().Frame("inner");
                IWebElement first = driver.FindElement(By.Id("oneline"));

                driver.SwitchTo().DefaultContent();
                IWebElement element = (IWebElement)((IJavaScriptExecutor)driver).ExecuteScript("return frames[0].document.getElementById('oneline');");


                driver.SwitchTo().Frame("inner");

                IWebElement second = driver.FindElement(By.Id("oneline"));

                Assert.AreEqual(first, element);
                Assert.AreEqual(second, element);
            }
            finally
            {
                driver.SwitchTo().DefaultContent();
            }
        }

        /////////////////////////////////////////////////
        // Tests unique to the .NET bindings
        /////////////////////////////////////////////////

        [Test]
        public void ShouldBeAbleToInjectXPathEngineIfNeeded()
        {
            driver.Url = alertsPage;
            driver.FindElement(By.XPath("//body"));
            driver.FindElement(By.XPath("//h1"));
            driver.FindElement(By.XPath("//div"));
            driver.FindElement(By.XPath("//p"));
            driver.FindElement(By.XPath("//a"));
        }

        [Test]
        public void ShouldFindElementByLinkTextContainingDoubleQuote()
        {
            driver.Url = simpleTestPage;
            IWebElement element = driver.FindElement(By.LinkText("link with \" (double quote)"));
            Assert.AreEqual("quote", element.GetAttribute("id"));
        }

        [Test]
        public void ShouldFindElementByLinkTextContainingBackslash()
        {
            driver.Url = simpleTestPage;
            IWebElement element = driver.FindElement(By.LinkText("link with \\ (backslash)"));
            Assert.AreEqual("backslash", element.GetAttribute("id"));
        }

        private bool SupportsSelectorApi()
        {
            IJavaScriptExecutor javascriptDriver = driver as IJavaScriptExecutor;
            IFindsByCssSelector cssSelectorDriver = driver as IFindsByCssSelector;
            return (cssSelectorDriver != null) && (javascriptDriver != null);
        }
    }
}
