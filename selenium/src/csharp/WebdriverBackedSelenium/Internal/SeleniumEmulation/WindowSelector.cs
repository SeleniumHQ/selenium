using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using OpenQA.Selenium;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class WindowSelector
    {
        private Dictionary<string, string> lastFrame = new Dictionary<string, string>();
        private string originalWindowHandle;

        public WindowSelector(IWebDriver driver)
        {
            originalWindowHandle = driver.GetWindowHandle();
        }

        public void SelectWindow(IWebDriver driver, string windowId)
        {
            if (windowId == "null")
            {
                driver.SwitchTo().Window(originalWindowHandle);
            }
            else if (windowId == "_blank")
            {
                SelectBlankWindow(driver);
            }
            else
            {
                if (windowId.StartsWith("title=", StringComparison.Ordinal))
                {
                    SelectWindowWithTitle(driver, windowId.Substring("title=".Length));
                    return;
                }

                if (windowId.StartsWith("name=", StringComparison.Ordinal))
                {
                    windowId = windowId.Substring("name=".Length);
                }

                try
                {
                    driver.SwitchTo().Window(windowId);
                }
                catch (NoSuchWindowException)
                {
                    SelectWindowWithTitle(driver, windowId);
                }
            }

            if (lastFrame.ContainsKey(driver.GetWindowHandle()))
            {
                // If the frame has gone, fall back
                try
                {
                    SelectFrame(driver, lastFrame[driver.GetWindowHandle()]);
                }
                catch (SeleniumException)
                {
                    lastFrame.Remove(driver.GetWindowHandle());
                }
            }
        }

        public void SelectFrame(IWebDriver driver, string locator)
        {
            if (locator == "relative=top")
            {
                driver.SwitchTo().DefaultContent();
                lastFrame.Remove(driver.GetWindowHandle());
                return;
            }

            try
            {
                lastFrame.Add(driver.GetWindowHandle(), locator);
                driver.SwitchTo().Frame(locator);
            }
            catch (NoSuchFrameException e)
            {
                throw new SeleniumException(e.Message);
            }
        }

        /**
         * Selects the only <code>_blank</code> window. A window open with
         * <code>target='_blank'</code> will have a <code>window.name = null</code>.
         * <p/>
         * <p>This method assumes that there will only be one single
         * <code>_blank</code> window and selects the first one with no name.
         * Therefore if for any reasons there are multiple windows with
         * <code>window.name = null</code> the first found one will be selected.
         * <p/>
         * <p>If none of the windows have <code>window.name = null</code> the last
         * selected one will be re-selected and a {@link SeleniumException} will
         * be thrown.
         *
         * @throws NoSuchWindowException if no window with
         *                               <code>window.name = null</code> is found.
         */
        public void SelectBlankWindow(IWebDriver driver)
        {
            string current = driver.GetWindowHandle();

            // Find the first window without a "name" attribute
            ReadOnlyCollection<string> handles = driver.GetWindowHandles();
            foreach (string handle in handles)
            {
                // the original window will never be a _blank window, so don't even look at it
                // this is also important to skip, because the original/root window won't have
                // a name either, so if we didn't know better we might think it's a _blank popup!
                if (handle == originalWindowHandle)
                {
                    continue;
                }

                driver.SwitchTo().Window(handle);
                string value = ((IJavaScriptExecutor)driver).ExecuteScript("return window.name;").ToString();
                if (string.IsNullOrEmpty(value))
                {
                    // We found it!
                    return;
                }
            }

            // We couldn't find it
            driver.SwitchTo().Window(current);
            throw new SeleniumException("Unable to select window _blank");
        }

        private static void SelectWindowWithTitle(IWebDriver driver, string title)
        {
            bool windowSuccessfullySwitched = false;
            string current = driver.GetWindowHandle();
            foreach (string handle in driver.GetWindowHandles())
            {
                driver.SwitchTo().Window(handle);
                if (title == driver.Title)
                {
                    windowSuccessfullySwitched = true;
                    break;
                }
            }

            if (!windowSuccessfullySwitched)
            {
                driver.SwitchTo().Window(current);
                throw new SeleniumException("Unable to select window with title: " + title);
            }
        }
    }
}
