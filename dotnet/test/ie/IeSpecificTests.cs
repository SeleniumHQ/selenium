using NUnit.Framework;
using System;
using System.Linq;
using OpenQA.Selenium.Environment;
using System.Collections.ObjectModel;
using OpenQA.Selenium.Interactions;
using System.Collections.Generic;

namespace OpenQA.Selenium.IE
{
    [TestFixture]
    public class IeSpecificTests : DriverTestFixture
    {
        //[Test]
        public void KeysTest()
        {
            List<string> keyComboNames = new List<string>()
            {
                "Control",
                "Shift",
                "Alt",
                "Control + Shift",
                "Control + Alt",
                "Shift + Alt",
                "Control + Shift + Alt"
            };

            List<string> colorNames = new List<string>()
            {
                "red",
                "green",
                "lightblue",
                "yellow",
                "lightgreen",
                "silver",
                "magenta"
            };

            List<List<string>> modifierCombonations = new List<List<string>>()
            {
                new List<string>() { Keys.Control },
                new List<string>() { Keys.Shift },
                new List<string>() { Keys.Alt },
                new List<string>() { Keys.Control, Keys.Shift },
                new List<string>() { Keys.Control, Keys.Alt },
                new List<string>() { Keys.Shift, Keys.Alt },
                new List<string>() { Keys.Control, Keys.Shift, Keys.Alt}
            };

            List<string> expectedColors = new List<string>()
            {
                "rgba(255, 0, 0, 1)",
                "rgba(0, 128, 0, 1)",
                "rgba(173, 216, 230, 1)",
                "rgba(255, 255, 0, 1)",
                "rgba(144, 238, 144, 1)",
                "rgba(192, 192, 192, 1)",
                "rgba(255, 0, 255, 1)"
            };

            bool passed = true;
            string errors = string.Empty;

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("keyboard_shortcut.html");
            IWebElement body = driver.FindElement(By.CssSelector("body"));
            Actions actions = new Actions(driver);
            for (int i = 0; i < keyComboNames.Count; i++)
            {
                for (int j = 0; j < modifierCombonations[i].Count; j++)
                {
                    actions.KeyDown(modifierCombonations[i][j]);
                }

                actions.SendKeys("1");

                // Alternatively, the following single line of code would release
                // all modifier keys, instead of looping through each key.
                // actions.SendKeys(Keys.Null);
                for (int j = 0; j < modifierCombonations[i].Count; j++)
                {
                    actions.KeyUp(modifierCombonations[i][j]);
                }

                actions.Perform();
                string background = body.GetCssValue("background-color");
                passed = passed && background == expectedColors[i];
                if (background != expectedColors[i])
                {
                    if (errors.Length > 0)
                    {
                        errors += "\n";
                    }

                    errors += string.Format("Key not properly processed for {0}. Background should be {1}, Expected: '{2}', Actual: '{3}'",
                        keyComboNames[i],
                        colorNames[i],
                        expectedColors[i],
                        background);
                }
            }

            Assert.IsTrue(passed, errors);
        }

        //[Test]
        public void InputOnChangeAlert()
        {
            driver.Url = alertsPage;
            driver.FindElement(By.Id("input")).Clear();
            IAlert alert = WaitFor<IAlert>(() => { return driver.SwitchTo().Alert(); }, "No alert found");
            alert.Accept();
        }

        //[Test]
        public void ScrollingFrameTest()
        {
            try
            {
                driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("frameScrollPage.html");

                WaitFor(FrameToExistAndBeSwitchedTo("scrolling_frame"), "No frame with name or id 'scrolling_frame' found");
                IWebElement element = driver.FindElement(By.Name("scroll_checkbox"));
                element.Click();
                Assert.IsTrue(element.Selected);

                driver.SwitchTo().DefaultContent();

                WaitFor(FrameToExistAndBeSwitchedTo("scrolling_child_frame"), "No frame with name or id 'scrolling_child_frame' found");
                WaitFor(FrameToExistAndBeSwitchedTo("scrolling_frame"), "No frame with name or id 'scrolling_frame' found");
                element = driver.FindElement(By.Name("scroll_checkbox"));
                element.Click();
                Assert.IsTrue(element.Selected);
            }
            finally
            {
                driver.SwitchTo().DefaultContent();
            }
        }

        //[Test]
        public void AlertSelectTest()
        {
            driver.Url = alertsPage;
            driver.FindElement(By.Id("value1")).Click();
            IAlert alert = WaitFor<IAlert>(() => { return driver.SwitchTo().Alert(); }, "No alert found");
            alert.Accept();
        }

        //[Test]
        public void ShouldBeAbleToBrowseTransformedXml()
        {
            driver.Url = xhtmlTestPage;
            driver.FindElement(By.Id("linkId")).Click();

            // Using transformed XML (Issue 1203)
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("transformable.xml");
            driver.FindElement(By.Id("x")).Click();
            // Sleep is required; driver may not be fast enough after this Click().
            System.Threading.Thread.Sleep(2000);
            Assert.AreEqual("XHTML Test Page", driver.Title);

            // Act on the result page to make sure the window handling is still valid.
            driver.FindElement(By.Id("linkId")).Click();
            Assert.AreEqual("We Arrive Here", driver.Title);
        }

        //[Test]
        public void ShouldBeAbleToStartMoreThanOneInstanceOfTheIEDriverSimultaneously()
        {
            IWebDriver secondDriver = new InternetExplorerDriver();

            driver.Url = xhtmlTestPage;
            secondDriver.Url = formsPage;

            Assert.AreEqual("XHTML Test Page", driver.Title);
            Assert.AreEqual("We Leave From Here", secondDriver.Title);

            // We only need to quit the second driver if the test passes
            secondDriver.Quit();
        }

        //[Test]
        public void ShouldPropagateSessionCookies()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("sessionCookie.html");
            IWebElement setColorButton = driver.FindElement(By.Id("setcolorbutton"));
            setColorButton.Click();
            IWebElement openWindowButton = driver.FindElement(By.Id("openwindowbutton"));
            openWindowButton.Click();
            System.Threading.Thread.Sleep(2000);
            string startWindow = driver.CurrentWindowHandle;
            driver.SwitchTo().Window("cookiedestwindow");
            string bodyStyle = driver.FindElement(By.TagName("body")).GetAttribute("style");
            driver.Close();
            driver.SwitchTo().Window(startWindow);
            Assert.IsTrue(bodyStyle.Contains("BACKGROUND-COLOR: #80ffff") || bodyStyle.Contains("background-color: rgb(128, 255, 255)"));
        }

        //[Test]
        public void ShouldHandleShowModalDialogWindows()
        {
            driver.Url = alertsPage;
            string originalWindowHandle = driver.CurrentWindowHandle;
            IWebElement element = driver.FindElement(By.Id("dialog"));
            element.Click();

            WaitFor(() => { return driver.WindowHandles.Count > 1; }, "Window count was not greater than 1");

            ReadOnlyCollection<string> windowHandles = driver.WindowHandles;
            Assert.AreEqual(2, windowHandles.Count);

            string dialogHandle = string.Empty;
            foreach (string handle in windowHandles)
            {
                if (handle != originalWindowHandle)
                {
                    dialogHandle = handle;
                    break;
                }
            }

            Assert.AreNotEqual(string.Empty, dialogHandle);

            driver.SwitchTo().Window(dialogHandle);
            IWebElement closeElement = driver.FindElement(By.Id("close"));
            closeElement.Click();

            WaitFor(() => { return driver.WindowHandles.Count == 1; }, "Window count was not 1");

            windowHandles = driver.WindowHandles;
            Assert.AreEqual(1, windowHandles.Count);
            driver.SwitchTo().Window(originalWindowHandle);
        }

        //[Test]
        public void ScrollTest()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scroll.html");
            driver.FindElement(By.Id("line8")).Click();
            Assert.AreEqual("line8", driver.FindElement(By.Id("clicked")).Text);
            driver.FindElement(By.Id("line1")).Click();
            Assert.AreEqual("line1", driver.FindElement(By.Id("clicked")).Text);
        }

        //[Test]
        public void ShouldNotScrollOverflowElementsWhichAreVisible()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scroll2.html");
            var list = driver.FindElement(By.TagName("ul"));
            var item = list.FindElement(By.Id("desired"));
            item.Click();
            Assert.AreEqual(0, ((IJavaScriptExecutor)driver).ExecuteScript("return arguments[0].scrollTop;", list), "Should not have scrolled");
        }

        //[Test]
        public void ShouldNotScrollIfAlreadyScrolledAndElementIsInView()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("scroll3.html");
            driver.FindElement(By.Id("button1")).Click();
            var scrollTop = GetScrollTop();
            driver.FindElement(By.Id("button2")).Click();
            Assert.AreEqual(scrollTop, GetScrollTop());
        }

        //[Test]
        public void ShouldBeAbleToHandleCascadingModalDialogs()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("modal_dialogs/modalindex.html");
            string parentHandle = driver.CurrentWindowHandle;

            // Launch first modal
            driver.FindElement(By.CssSelector("input[type='button'][value='btn1']")).Click();
            WaitFor(() => { return driver.WindowHandles.Count > 1; }, "Window count was not greater than 1");
            ReadOnlyCollection<string> windows = driver.WindowHandles;
            string firstWindowHandle = windows.Except(new List<string>() { parentHandle }).First();
            driver.SwitchTo().Window(firstWindowHandle);
            Assert.AreEqual(2, windows.Count);

            // Launch second modal
            driver.FindElement(By.CssSelector("input[type='button'][value='btn2']")).Click();
            WaitFor(() => { return driver.WindowHandles.Count > 2; }, "Window count was not greater than 2");
            ReadOnlyCollection<string> windows_1 = driver.WindowHandles;
            string secondWindowHandle = windows_1.Except(windows).First();
            driver.SwitchTo().Window(secondWindowHandle);
            Assert.AreEqual(3, windows_1.Count);

            // Launch third modal
            driver.FindElement(By.CssSelector("input[type='button'][value='btn3']")).Click();
            WaitFor(() => { return driver.WindowHandles.Count > 3; }, "Window count was not greater than 3");
            ReadOnlyCollection<string> windows_2 = driver.WindowHandles;
            string finalWindowHandle = windows_2.Except(windows_1).First();
            Assert.AreEqual(4, windows_2.Count);

            driver.SwitchTo().Window(finalWindowHandle).Close();
            driver.SwitchTo().Window(secondWindowHandle).Close();
            driver.SwitchTo().Window(firstWindowHandle).Close();
            driver.SwitchTo().Window(parentHandle);
        }

        //[Test]
        public void ShouldBeAbleToHandleCascadingModalDialogsLaunchedWithJavaScriptLinks()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("modal_dialogs/modalindex.html");
            string parentHandle = driver.CurrentWindowHandle;

            // Launch first modal
            driver.FindElement(By.CssSelector("a[id='lnk1']")).Click();
            WaitFor(() => { return driver.WindowHandles.Count > 1; }, "Window count was not greater than 1");
            ReadOnlyCollection<string> windows = driver.WindowHandles;
            string firstWindowHandle = windows.Except(new List<string>() { parentHandle }).First();
            driver.SwitchTo().Window(firstWindowHandle);
            Assert.AreEqual(2, windows.Count);

            // Launch second modal
            driver.FindElement(By.CssSelector("a[id='lnk2']")).Click();
            System.Threading.Thread.Sleep(5000);
            WaitFor(() => { return driver.WindowHandles.Count > 2; }, "Window count was not greater than 2");
            ReadOnlyCollection<string> windows_1 = driver.WindowHandles;
            string secondWindowHandle = windows_1.Except(windows).First();
            driver.SwitchTo().Window(secondWindowHandle);
            Assert.AreEqual(3, windows_1.Count);

            // Launch third modal
            driver.FindElement(By.CssSelector("a[id='lnk3']")).Click();
            WaitFor(() => { return driver.WindowHandles.Count > 3; }, "Window count was not greater than 3");
            ReadOnlyCollection<string> windows_2 = driver.WindowHandles;
            string finalWindowHandle = windows_2.Except(windows_1).First();
            Assert.AreEqual(4, windows_2.Count);

            driver.SwitchTo().Window(finalWindowHandle).Close();
            driver.SwitchTo().Window(secondWindowHandle).Close();
            driver.SwitchTo().Window(firstWindowHandle).Close();
            driver.SwitchTo().Window(parentHandle);
        }

        //[Test]
        public void TestInvisibleZOrder()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("elementObscuredByInvisibleElement.html");
            IWebElement element = driver.FindElement(By.CssSelector("#gLink"));
            element.Click();
        }

        private long GetScrollTop()
        {
            return (long)((IJavaScriptExecutor)driver).ExecuteScript("return document.body.scrollTop;");
        }

        private Func<bool> FrameToExistAndBeSwitchedTo(string frameName)
        {
            return () =>
            {
                try
                {
                    driver.SwitchTo().Frame(frameName);
                }
                catch (NoSuchFrameException)
                {
                    return false;
                }

                return true;
            };
        }
    }
}
