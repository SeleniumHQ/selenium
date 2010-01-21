using System;
using System.Globalization;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Internal class for returning Results
    /// </summary>
    internal static class ResultHandler
    {
        /// <summary>
        /// Verifies the results
        /// </summary>
        /// <param name="resultCode">Code returned from the driver</param>
        /// <param name="messageReturned">Message to be returned</param>
        internal static void VerifyResultCode(WebDriverResult resultCode, string messageReturned)
        {
            switch (resultCode)
            {
                case WebDriverResult.Success:
                    break; // Nothing to do

                case WebDriverResult.NoSuchElement:
                    throw new NoSuchElementException(messageReturned);

                case WebDriverResult.NoSuchFrame:
                    throw new NoSuchFrameException(messageReturned);

                case WebDriverResult.NotImplemented:
                    throw new NotImplementedException("You may not perform the requested action");

                case WebDriverResult.ObsoleteElement:
                    throw new StaleElementReferenceException(string.Format(CultureInfo.InvariantCulture, "You may not {0} this element. It looks as if the reference is stale. Did you navigate away from the page with this element on?", messageReturned));

                case WebDriverResult.ElementNotDisplayed:
                    throw new ElementNotVisibleException(string.Format(CultureInfo.InvariantCulture, "You may not {0} an element that is not displayed", messageReturned));

                case WebDriverResult.ElementNotEnabled:
                    throw new NotSupportedException(string.Format(CultureInfo.InvariantCulture, "You may not {0} an element that is not enabled", messageReturned));

                case WebDriverResult.UnhandledError:
                    throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, "Unhandled Error: {0}", messageReturned));

                case WebDriverResult.ElementNotSelected:
                    throw new NotSupportedException(string.Format(CultureInfo.InvariantCulture, "The element appears to be unselectable: {0}", messageReturned));

                case WebDriverResult.NoSuchDocument:
                    throw new NoSuchElementException(messageReturned + " (no document found)");

                case WebDriverResult.Timeout:
                    throw new TimeoutException("The driver reported that the command timed out. There may "
                                               + "be several reasons for this. Check that the destination"
                                               + "site is in IE's 'Trusted Sites' (accessed from Tools->"
                                               + "Internet Options in the 'Security' tab) If it is a "
                                               + "trusted site, then the request may have taken more than"
                                               + "a minute to finish.");

                case WebDriverResult.NoSuchWindow:
                    throw new NoSuchWindowException(messageReturned);

                default:
                    throw new InvalidOperationException(string.Format(CultureInfo.InvariantCulture, "{0} ({1})", messageReturned, resultCode));
            }
        }
    }
}
