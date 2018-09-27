// <copyright file="ExpectedConditions.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text.RegularExpressions;

namespace OpenQA.Selenium.Support.UI
{
    /// <summary>
    /// Supplies a set of common conditions that can be waited for using <see cref="WebDriverWait"/>.
    /// </summary>
    /// <example>
    /// <code>
    /// IWait wait = new WebDriverWait(driver, TimeSpan.FromSeconds(3))
    /// IWebElement element = wait.Until(ExpectedConditions.ElementExists(By.Id("foo")));
    /// </code>
    /// </example>
    [Obsolete("The ExpectedConditions implementation in the .NET bindings is deprecated and will be removed in a future release. This portion of the code has been migrated to the DotNetSeleniumExtras repository on GitHub (https://github.com/DotNetSeleniumTools/DotNetSeleniumExtras)")]
    public sealed class ExpectedConditions
    {
        /// <summary>
        /// Prevents a default instance of the <see cref="ExpectedConditions"/> class from being created.
        /// </summary>
        private ExpectedConditions()
        {
        }

        /// <summary>
        /// An expectation for checking the title of a page.
        /// </summary>
        /// <param name="title">The expected title, which must be an exact match.</param>
        /// <returns><see langword="true"/> when the title matches; otherwise, <see langword="false"/>.</returns>
        public static Func<IWebDriver, bool> TitleIs(string title)
        {
            return (driver) => { return title == driver.Title; };
        }

        /// <summary>
        /// An expectation for checking that the title of a page contains a case-sensitive substring.
        /// </summary>
        /// <param name="title">The fragment of title expected.</param>
        /// <returns><see langword="true"/> when the title matches; otherwise, <see langword="false"/>.</returns>
        public static Func<IWebDriver, bool> TitleContains(string title)
        {
            return (driver) => { return driver.Title.Contains(title); };
        }

        /// <summary>
        /// An expectation for the URL of the current page to be a specific URL.
        /// </summary>
        /// <param name="url">The URL that the page should be on</param>
        /// <returns><see langword="true"/> when the URL is what it should be; otherwise, <see langword="false"/>.</returns>
        public static Func<IWebDriver, bool> UrlToBe(string url)
        {
            return (driver) => { return driver.Url.ToLowerInvariant().Equals(url.ToLowerInvariant()); };
        }

        /// <summary>
        /// An expectation for the URL of the current page to be a specific URL.
        /// </summary>
        /// <param name="fraction">The fraction of the url that the page should be on</param>
        /// <returns><see langword="true"/> when the URL contains the text; otherwise, <see langword="false"/>.</returns>
        public static Func<IWebDriver, bool> UrlContains(string fraction)
        {
            return (driver) => { return driver.Url.ToLowerInvariant().Contains(fraction.ToLowerInvariant()); };
        }

        /// <summary>
        /// An expectation for the URL of the current page to be a specific URL.
        /// </summary>
        /// <param name="regex">The regular expression that the URL should match</param>
        /// <returns><see langword="true"/> if the URL matches the specified regular expression; otherwise, <see langword="false"/>.</returns>
        public static Func<IWebDriver, bool> UrlMatches(string regex)
        {
            return (driver) =>
            {
                var currentUrl = driver.Url;
                var pattern = new Regex(regex, RegexOptions.IgnoreCase);
                var match = pattern.Match(currentUrl);
                return match.Success;
            };
        }

        /// <summary>
        /// An expectation for checking that an element is present on the DOM of a
        /// page. This does not necessarily mean that the element is visible.
        /// </summary>
        /// <param name="locator">The locator used to find the element.</param>
        /// <returns>The <see cref="IWebElement"/> once it is located.</returns>
        public static Func<IWebDriver, IWebElement> ElementExists(By locator)
        {
            return (driver) => { return driver.FindElement(locator); };
        }

        /// <summary>
        /// An expectation for checking that an element is present on the DOM of a page
        /// and visible. Visibility means that the element is not only displayed but
        /// also has a height and width that is greater than 0.
        /// </summary>
        /// <param name="locator">The locator used to find the element.</param>
        /// <returns>The <see cref="IWebElement"/> once it is located and visible.</returns>
        public static Func<IWebDriver, IWebElement> ElementIsVisible(By locator)
        {
            return (driver) =>
                {
                    try
                    {
                        return ElementIfVisible(driver.FindElement(locator));
                    }
                    catch (StaleElementReferenceException)
                    {
                        return null;
                    }
                };
        }

        /// <summary>
        /// An expectation for checking that all elements present on the web page that
        /// match the locator are visible. Visibility means that the elements are not
        /// only displayed but also have a height and width that is greater than 0.
        /// </summary>
        /// <param name="locator">The locator used to find the element.</param>
        /// <returns>The list of <see cref="IWebElement"/> once it is located and visible.</returns>
        public static Func<IWebDriver, ReadOnlyCollection<IWebElement>> VisibilityOfAllElementsLocatedBy(By locator)
        {
            return (driver) =>
            {
                try
                {
                    var elements = driver.FindElements(locator);
                    if (elements.Any(element => !element.Displayed))
                    {
                        return null;
                    }

                    return elements.Any() ? elements : null;
                }
                catch (StaleElementReferenceException)
                {
                    return null;
                }
            };
        }

        /// <summary>
        /// An expectation for checking that all elements present on the web page that
        /// match the locator are visible. Visibility means that the elements are not
        /// only displayed but also have a height and width that is greater than 0.
        /// </summary>
        /// <param name="elements">list of WebElements</param>
        /// <returns>The list of <see cref="IWebElement"/> once it is located and visible.</returns>
        public static Func<IWebDriver, ReadOnlyCollection<IWebElement>> VisibilityOfAllElementsLocatedBy(ReadOnlyCollection<IWebElement> elements)
        {
            return (driver) =>
            {
                try
                {
                    if (elements.Any(element => !element.Displayed))
                    {
                        return null;
                    }

                    return elements.Any() ? elements : null;
                }
                catch (StaleElementReferenceException)
                {
                    return null;
                }
            };
        }

        /// <summary>
        /// An expectation for checking that all elements present on the web page that
        /// match the locator.
        /// </summary>
        /// <param name="locator">The locator used to find the element.</param>
        /// <returns>The list of <see cref="IWebElement"/> once it is located.</returns>
        public static Func<IWebDriver, ReadOnlyCollection<IWebElement>> PresenceOfAllElementsLocatedBy(By locator)
        {
            return (driver) =>
            {
                try
                {
                    var elements = driver.FindElements(locator);
                    return elements.Any() ? elements : null;
                }
                catch (StaleElementReferenceException)
                {
                    return null;
                }
            };
        }

        /// <summary>
        /// An expectation for checking if the given text is present in the specified element.
        /// </summary>
        /// <param name="element">The WebElement</param>
        /// <param name="text">Text to be present in the element</param>
        /// <returns><see langword="true"/> once the element contains the given text; otherwise, <see langword="false"/>.</returns>
        public static Func<IWebDriver, bool> TextToBePresentInElement(IWebElement element, string text)
        {
            return (driver) =>
            {
                try
                {
                    var elementText = element.Text;
                    return elementText.Contains(text);
                }
                catch (StaleElementReferenceException)
                {
                    return false;
                }
            };
        }

        /// <summary>
        /// An expectation for checking if the given text is present in the element that matches the given locator.
        /// </summary>
        /// <param name="locator">The locator used to find the element.</param>
        /// <param name="text">Text to be present in the element</param>
        /// <returns><see langword="true"/> once the element contains the given text; otherwise, <see langword="false"/>.</returns>
        public static Func<IWebDriver, bool> TextToBePresentInElementLocated(By locator, string text)
        {
            return (driver) =>
            {
                try
                {
                    var element = driver.FindElement(locator);
                    var elementText = element.Text;
                    return elementText.Contains(text);
                }
                catch (StaleElementReferenceException)
                {
                    return false;
                }
            };
        }

        /// <summary>
        /// An expectation for checking if the given text is present in the specified elements value attribute.
        /// </summary>
        /// <param name="element">The WebElement</param>
        /// <param name="text">Text to be present in the element</param>
        /// <returns><see langword="true"/> once the element contains the given text; otherwise, <see langword="false"/>.</returns>
        public static Func<IWebDriver, bool> TextToBePresentInElementValue(IWebElement element, string text)
        {
            return (driver) =>
            {
                try
                {
                    var elementValue = element.GetAttribute("value");
                    if (elementValue != null)
                    {
                        return elementValue.Contains(text);
                    }
                    else
                    {
                        return false;
                    }
                }
                catch (StaleElementReferenceException)
                {
                    return false;
                }
            };
        }

        /// <summary>
        /// An expectation for checking if the given text is present in the specified elements value attribute.
        /// </summary>
        /// <param name="locator">The locator used to find the element.</param>
        /// <param name="text">Text to be present in the element</param>
        /// <returns><see langword="true"/> once the element contains the given text; otherwise, <see langword="false"/>.</returns>
        public static Func<IWebDriver, bool> TextToBePresentInElementValue(By locator, string text)
        {
            return (driver) =>
            {
                try
                {
                    var element = driver.FindElement(locator);
                    var elementValue = element.GetAttribute("value");
                    if (elementValue != null)
                    {
                        return elementValue.Contains(text);
                    }
                    else
                    {
                        return false;
                    }
                }
                catch (StaleElementReferenceException)
                {
                    return false;
                }
            };
        }

        /// <summary>
        /// An expectation for checking whether the given frame is available to switch
        /// to. If the frame is available it switches the given driver to the
        /// specified frame.
        /// </summary>
        /// <param name="frameLocator">Used to find the frame (id or name)</param>
        /// <returns><see cref="IWebDriver"/></returns>
        public static Func<IWebDriver, IWebDriver> FrameToBeAvailableAndSwitchToIt(string frameLocator)
        {
            return (driver) =>
            {
                try
                {
                    return driver.SwitchTo().Frame(frameLocator);
                }
                catch (NoSuchFrameException)
                {
                    return null;
                }
            };
        }

        /// <summary>
        /// An expectation for checking whether the given frame is available to switch
        /// to. If the frame is available it switches the given driver to the
        /// specified frame.
        /// </summary>
        /// <param name="locator">Locator for the Frame</param>
        /// <returns><see cref="IWebDriver"/></returns>
        public static Func<IWebDriver, IWebDriver> FrameToBeAvailableAndSwitchToIt(By locator)
        {
            return (driver) =>
            {
                try
                {
                    var frameElement = driver.FindElement(locator);
                    return driver.SwitchTo().Frame(frameElement);
                }
                catch (NoSuchFrameException)
                {
                    return null;
                }
            };
        }

        /// <summary>
        /// An expectation for checking that an element is either invisible or not present on the DOM.
        /// </summary>
        /// <param name="locator">The locator used to find the element.</param>
        /// <returns><see langword="true"/> if the element is not displayed; otherwise, <see langword="false"/>.</returns>
        public static Func<IWebDriver, bool> InvisibilityOfElementLocated(By locator)
        {
            return (driver) =>
            {
                try
                {
                    var element = driver.FindElement(locator);
                    return !element.Displayed;
                }
                catch (NoSuchElementException)
                {
                    // Returns true because the element is not present in DOM. The
                    // try block checks if the element is present but is invisible.
                    return true;
                }
                catch (StaleElementReferenceException)
                {
                    // Returns true because stale element reference implies that element
                    // is no longer visible.
                    return true;
                }
            };
        }

        /// <summary>
        /// An expectation for checking that an element with text is either invisible or not present on the DOM.
        /// </summary>
        /// <param name="locator">The locator used to find the element.</param>
        /// <param name="text">Text of the element</param>
        /// <returns><see langword="true"/> if the element is not displayed; otherwise, <see langword="false"/>.</returns>
        public static Func<IWebDriver, bool> InvisibilityOfElementWithText(By locator, string text)
        {
            return (driver) =>
            {
                try
                {
                    var element = driver.FindElement(locator);
                    var elementText = element.Text;
                    if (string.IsNullOrEmpty(elementText))
                    {
                        return true;
                    }

                    return !elementText.Equals(text);
                }
                catch (NoSuchElementException)
                {
                    // Returns true because the element with text is not present in DOM. The
                    // try block checks if the element is present but is invisible.
                    return true;
                }
                catch (StaleElementReferenceException)
                {
                    // Returns true because stale element reference implies that element
                    // is no longer visible.
                    return true;
                }
            };
        }

        /// <summary>
        /// An expectation for checking an element is visible and enabled such that you
        /// can click it.
        /// </summary>
        /// <param name="locator">The locator used to find the element.</param>
        /// <returns>The <see cref="IWebElement"/> once it is located and clickable (visible and enabled).</returns>
        public static Func<IWebDriver, IWebElement> ElementToBeClickable(By locator)
        {
            return (driver) =>
            {
                var element = ElementIfVisible(driver.FindElement(locator));
                try
                {
                    if (element != null && element.Enabled)
                    {
                        return element;
                    }
                    else
                    {
                        return null;
                    }
                }
                catch (StaleElementReferenceException)
                {
                    return null;
                }
            };
        }

        /// <summary>
        /// An expectation for checking an element is visible and enabled such that you
        /// can click it.
        /// </summary>
        /// <param name="element">The element.</param>
        /// <returns>The <see cref="IWebElement"/> once it is clickable (visible and enabled).</returns>
        public static Func<IWebDriver, IWebElement> ElementToBeClickable(IWebElement element)
        {
            return (driver) =>
            {
                try
                {
                    if (element != null && element.Displayed && element.Enabled)
                    {
                        return element;
                    }
                    else
                    {
                        return null;
                    }
                }
                catch (StaleElementReferenceException)
                {
                    return null;
                }
            };
        }

        /// <summary>
        /// Wait until an element is no longer attached to the DOM.
        /// </summary>
        /// <param name="element">The element.</param>
        /// <returns><see langword="false"/> is the element is still attached to the DOM; otherwise, <see langword="true"/>.</returns>
        public static Func<IWebDriver, bool> StalenessOf(IWebElement element)
        {
            return (driver) =>
            {
                try
                {
                    // Calling any method forces a staleness check
                    return element == null || !element.Enabled;
                }
                catch (StaleElementReferenceException)
                {
                    return true;
                }
            };
        }

        /// <summary>
        /// An expectation for checking if the given element is selected.
        /// </summary>
        /// <param name="element">The element.</param>
        /// <returns><see langword="true"/> given element is selected.; otherwise, <see langword="false"/>.</returns>
        public static Func<IWebDriver, bool> ElementToBeSelected(IWebElement element)
        {
            return ElementSelectionStateToBe(element, true);
        }

        /// <summary>
        /// An expectation for checking if the given element is in correct state.
        /// </summary>
        /// <param name="element">The element.</param>
        /// <param name="selected">selected or not selected</param>
        /// <returns><see langword="true"/> given element is in correct state.; otherwise, <see langword="false"/>.</returns>
        public static Func<IWebDriver, bool> ElementToBeSelected(IWebElement element, bool selected)
        {
            return (driver) =>
            {
                return element.Selected == selected;
            };
        }

        /// <summary>
        /// An expectation for checking if the given element is in correct state.
        /// </summary>
        /// <param name="element">The element.</param>
        /// <param name="selected">selected or not selected</param>
        /// <returns><see langword="true"/> given element is in correct state.; otherwise, <see langword="false"/>.</returns>
        public static Func<IWebDriver, bool> ElementSelectionStateToBe(IWebElement element, bool selected)
        {
            return (driver) =>
            {
                return element.Selected == selected;
            };
        }

        /// <summary>
        /// An expectation for checking if the given element is selected.
        /// </summary>
        /// <param name="locator">The locator used to find the element.</param>
        /// <returns><see langword="true"/> given element is selected.; otherwise, <see langword="false"/>.</returns>
        public static Func<IWebDriver, bool> ElementToBeSelected(By locator)
        {
            return ElementSelectionStateToBe(locator, true);
        }

        /// <summary>
        /// An expectation for checking if the given element is in correct state.
        /// </summary>
        /// <param name="locator">The locator used to find the element.</param>
        /// <param name="selected">selected or not selected</param>
        /// <returns><see langword="true"/> given element is in correct state.; otherwise, <see langword="false"/>.</returns>
        public static Func<IWebDriver, bool> ElementSelectionStateToBe(By locator, bool selected)
        {
            return (driver) =>
            {
                try
                {
                    var element = driver.FindElement(locator);
                    return element.Selected == selected;
                }
                catch (StaleElementReferenceException)
                {
                    return false;
                }
            };
        }

        /// <summary>
        /// An expectation for checking the AlterIsPresent
        /// </summary>
        /// <returns>Alert </returns>
        public static Func<IWebDriver, IAlert> AlertIsPresent()
        {
            return (driver) =>
            {
                try
                {
                    return driver.SwitchTo().Alert();
                }
                catch (NoAlertPresentException)
                {
                    return null;
                }
            };
        }

        /// <summary>
        /// An expectation for checking the Alert State
        /// </summary>
        /// <param name="state">A value indicating whether or not an alert should be displayed in order to meet this condition.</param>
        /// <returns><see langword="true"/> alert is in correct state present or not present; otherwise, <see langword="false"/>.</returns>
        public static Func<IWebDriver, bool> AlertState(bool state)
        {
            return (driver) =>
            {
                var alertState = false;
                try
                {
                    driver.SwitchTo().Alert();
                    alertState = true;
                    return alertState == state;
                }
                catch (NoAlertPresentException)
                {
                    alertState = false;
                    return alertState == state;
                }
            };
        }

        private static IWebElement ElementIfVisible(IWebElement element)
        {
            return element.Displayed ? element : null;
        }
    }
}
