using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace OpenQA.Selenium.IE
{
    internal static class ResultHandler
    {
        internal static void VerifyResultCode(WebDriverResult resultCode, String message)
        {
            switch (resultCode)
            {
                case WebDriverResult.Success:
                    break; // Nothing to do

                case WebDriverResult.NoSuchElement:
                    throw new NoSuchElementException(message);

                case WebDriverResult.NoSuchFrame:
                    throw new NoSuchFrameException(message);

                case WebDriverResult.NotImplemented:
                    throw new NotImplementedException("You may not perform the requested action");

                case WebDriverResult.ObsoleteElement:
                    throw new StaleElementReferenceException(
                        string.Format(CultureInfo.InvariantCulture, "You may not {0} this element. It looks as if the reference is stale. " +
                                      "Did you navigate away from the page with this element on?", message));

                case WebDriverResult.ElementNotDisplayed:
                    throw new ElementNotVisibleException(
                        string.Format(CultureInfo.InvariantCulture, "You may not {0} an element that is not displayed", message));

                case WebDriverResult.ElementNotEnabled:
                    throw new NotSupportedException(
                        string.Format(CultureInfo.InvariantCulture, "You may not {0} an element that is not enabled", message));

                case WebDriverResult.UnhandledError:
                    throw new WebDriverException(
                            string.Format(CultureInfo.InvariantCulture, "Unhandled Error: {0}", message));

                case WebDriverResult.ElementNotSelected:
                    throw new NotSupportedException(
                            string.Format(CultureInfo.InvariantCulture, "The element appears to be unselectable: {0}", message));

                case WebDriverResult.NoSuchDocument:
                    throw new NoSuchElementException(message + " (no document found)");

                case WebDriverResult.Timeout:
                    throw new TimeoutException("The driver reported that the command timed out. There may "
                                                    + "be several reasons for this. Check that the destination"
                                                    + "site is in IE's 'Trusted Sites' (accessed from Tools->"
                                                    + "Internet Options in the 'Security' tab) If it is a "
                                                    + "trusted site, then the request may have taken more than"
                                                    + "a minute to finish.");

                case WebDriverResult.NoSuchWindow:
                    throw new NoSuchWindowException(message);

                default:
                    throw new InvalidOperationException(string.Format(CultureInfo.InvariantCulture, "{0} ({1})", message, resultCode));
            }
        }

    }
}
