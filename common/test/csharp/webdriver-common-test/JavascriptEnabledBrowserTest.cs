using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using System.Drawing;
using NUnit.Framework.Constraints;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class JavascriptEnabledBrowserTest : DriverTestFixture
    {
        [Test]
        [Category("Javascript")]
        public void DocumentShouldReflectLatestTitle()
        {
            driver.Url = javascriptPage;

            Assert.AreEqual("Testing Javascript", driver.Title);
            driver.FindElement(By.LinkText("Change the page title!")).Click();
            Assert.AreEqual("Changed", driver.Title);

            String titleViaXPath = driver.FindElement(By.XPath("/html/head/title")).Text;
            Assert.AreEqual("Changed", titleViaXPath);
        }

        [Test]
        [Category("Javascript")]
        public void DocumentShouldReflectLatestDom()
        {
            driver.Url = javascriptPage;
            String currentText = driver.FindElement(By.XPath("//div[@id='dynamo']")).Text;
            Assert.AreEqual("What's for dinner?", currentText);

            IWebElement element = driver.FindElement(By.LinkText("Update a div"));
            element.Click();

            String newText = driver.FindElement(By.XPath("//div[@id='dynamo']")).Text;
            Assert.AreEqual("Fish and chips!", newText);
        }

        //    public void ShouldAllowTheUserToOkayConfirmAlerts() {
        //		driver.Url = (alertPage);
        //		driver.FindElement(By.Id("confirm").Click();
        //		driver.switchTo().alert().accept();
        //		assertEquals("Hello WebDriver", driver.Title);
        //	}
        //
        //	public void ShouldAllowUserToDismissAlerts() {
        //		driver.Url = (alertPage);
        //		driver.FindElement(By.Id("confirm").Click();
        //
        //		driver.switchTo().alert().dimiss();
        //		assertEquals("Testing Alerts", driver.Title);
        //	}
        //
        //	public void ShouldBeAbleToGetTheTextOfAnAlert() {
        //		driver.Url = (alertPage);
        //		driver.FindElement(By.Id("confirm").Click();
        //
        //		String alertText = driver.switchTo().alert().Text;
        //		assertEquals("Are you sure?", alertText);
        //	}
        //
        //	public void ShouldThrowAnExceptionIfAnAlertIsBeingDisplayedAndTheUserAttemptsToCarryOnRegardless() {
        //		driver.Url = (alertPage);
        //		driver.FindElement(By.Id("confirm").Click();
        //
        //		try {
        //			driver.Url = (simpleTestPage);
        //			fail("Expected the alert not to allow further progress");
        //		} catch (UnhandledAlertException e) {
        //			// This is good
        //		}
        //	}

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.IE, "JavaScript execution is asynchronous with the driver in IE")]
        [IgnoreBrowser(Browser.ChromeNonWindows, "Chrome failing on OS X")]
        [IgnoreBrowser(Browser.IPhone, "does not detect that a new page loaded.")]
        public void ShouldWaitForLoadsToCompleteAfterJavascriptCausesANewPageToLoad()
        {
            driver.Url = formsPage;

            driver.FindElement(By.Id("changeme")).Select();

            Assert.AreEqual("Page3", driver.Title);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.IE, "JavaScript execution is asynchronous with the driver in IE")]
        [IgnoreBrowser(Browser.ChromeNonWindows, "Chrome failing on OS X")]
        [IgnoreBrowser(Browser.IPhone, "does not detect that a new page loaded.")]
        public void ShouldBeAbleToFindElementAfterJavascriptCausesANewPageToLoad()
        {
            driver.Url = formsPage;

            driver.FindElement(By.Id("changeme")).Select();

            Assert.AreEqual("3", driver.FindElement(By.Id("pageNumber")).Text);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToDetermineTheLocationOfAnElement()
        {
            driver.Url = xhtmlTestPage;

            IRenderedWebElement element = (IRenderedWebElement)driver.FindElement(By.Id("username"));
            Point location = element.Location;

            Assert.Greater(location.X, 0);
            Assert.Greater(location.Y, 0);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToDetermineTheSizeOfAnElement()
        {
            driver.Url = xhtmlTestPage;

            IRenderedWebElement element = (IRenderedWebElement)driver.FindElement(By.Id("username"));
            Size size = element.Size;

            Assert.Greater(size.Width, 0);
            Assert.Greater(size.Height, 0);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.ChromeNonWindows)]
        [IgnoreBrowser(Browser.IPhone, "sendKeys not implemented correctly")]
        public void ShouldFireOnChangeEventWhenSettingAnElementsValue()
        {
            driver.Url = javascriptPage;
            driver.FindElement(By.Id("change")).SendKeys("foo");
            String result = driver.FindElement(By.Id("result")).Text;

            Assert.AreEqual("change", result);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToSubmitFormsByCausingTheOnClickEventToFire()
        {
            driver.Url = javascriptPage;
            IWebElement element = driver.FindElement(By.Id("jsSubmitButton"));
            element.Click();

            Assert.AreEqual("We Arrive Here", driver.Title);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.IE, "Fails for IE in the continuous build")]
        public void ShouldBeAbleToClickOnSubmitButtons()
        {
            driver.Url = javascriptPage;
            IWebElement element = driver.FindElement(By.Id("submittingButton"));
            element.Click();

            Assert.AreEqual("We Arrive Here", driver.Title);
        }

        [Test]
        [Category("Javascript")]
        public void Issue80ClickShouldGenerateClickEvent()
        {
            driver.Url = javascriptPage;
            IWebElement element = driver.FindElement(By.Id("clickField"));
            Assert.AreEqual("Hello", element.Value);

            element.Click();

            Assert.AreEqual("Clicked", element.Value);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.IPhone, "iPhone: focus doesn't change as expected")]
        public void ShouldBeAbleToSwitchToFocusedElement()
        {
            driver.Url = javascriptPage;

            driver.FindElement(By.Id("switchFocus")).Click();

            IWebElement element = driver.SwitchTo().ActiveElement();
            Assert.AreEqual("theworks", element.GetAttribute("id"));
        }

        [Test]
        [Category("Javascript")]
        public void IfNoElementHasFocusTheActiveElementIsTheBody()
        {
            driver.Url = simpleTestPage;

            IWebElement element = driver.SwitchTo().ActiveElement();

            Assert.AreEqual("body", element.GetAttribute("name"));
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.IE, "not properly tested")]
        [IgnoreBrowser(Browser.Firefox, "Window demands focus to work.")]
        [IgnoreBrowser(Browser.Chrome, "Event firing is broken")]
        public void ChangeEventIsFiredAppropriatelyWhenFocusIsLost()
        {
            driver.Url = javascriptPage;

            IWebElement input = driver.FindElement(By.Id("changeable"));
            input.SendKeys("test");
            driver.FindElement(By.Id("clickField")).Click(); // move focus
            EqualConstraint firstConstraint = new EqualConstraint("focus change blur");
            EqualConstraint secondConstraint = new EqualConstraint("focus change blur");


            Assert.That(driver.FindElement(By.Id("result")).Text.Trim(), firstConstraint | secondConstraint);

            input.SendKeys(Keys.Backspace + "t");
            driver.FindElement(By.XPath("//body")).Click();  // move focus

            firstConstraint = new EqualConstraint("focus change blur focus blur");
            secondConstraint = new EqualConstraint("focus blur change focus blur");
            EqualConstraint thirdConstraint = new EqualConstraint("focus blur change focus blur change");
            EqualConstraint fourthConstraint = new EqualConstraint("focus change blur focus change blur"); //What Chrome does
            // I weep.
            Assert.That(driver.FindElement(By.Id("result")).Text.Trim(),
                       firstConstraint | secondConstraint | thirdConstraint | fourthConstraint);
        }

        /**
         * If the click handler throws an exception, the firefox driver freezes. This is suboptimal.
         */
        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToClickIfEvenSomethingHorribleHappens()
        {
            driver.Url = javascriptPage;

            driver.FindElement(By.Id("error")).Click();

            // If we get this far then the test has passed, but let's do something basic to prove the point
            String text = driver.FindElement(By.Id("error")).Text;

            Assert.IsNotNull(text);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldBeAbleToGetTheLocationOfAnElement()
        {
            driver.Url = javascriptPage;

            if (!(driver is IJavaScriptExecutor))
            {
                return;
            }

            ((IJavaScriptExecutor)driver).ExecuteScript("window.focus();");
            IWebElement element = driver.FindElement(By.Id("keyUp"));

            if (!(element is ILocatable))
            {
                return;
            }

            Point point = ((ILocatable)element).LocationOnScreenOnceScrolledIntoView;

            Assert.Greater(point.X, 1);
            Assert.Greater(point.Y, 1);
        }
    }
}
