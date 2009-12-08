using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium.IE
{
    public class ErrorHandler
    {
        public static void VerifyErrorCode(int errorCode, String message)
        {
            ErrorCodes castErrorCode = (ErrorCodes)errorCode;
            switch (castErrorCode)
            {
                case ErrorCodes.Success:
                    break; // Nothing to do

                case ErrorCodes.NoSuchElement:
                    throw new NoSuchElementException(message);

                case ErrorCodes.NoSuchFrame:
                    throw new NoSuchFrameException(message);

                case ErrorCodes.NotImplemented:
                    throw new NotImplementedException("You may not perform the requested action");

                case ErrorCodes.ObsoleteElement:
                    throw new StaleElementReferenceException(
                        String.Format("You may not {0} this element. It looks as if the reference is stale. " +
                                      "Did you navigate away from the page with this element on?", message));

                case ErrorCodes.ElementNotDisplayed:
                    throw new ElementNotVisibleException(
                        String.Format("You may not {0} an element that is not displayed", message));

                case ErrorCodes.ElementNotEnabled:
                    throw new NotSupportedException(
                        String.Format("You may not {0} an element that is not enabled", message));

                case ErrorCodes.UnhandledError:
                    throw new WebDriverException(
                            String.Format("Unhandled Error: {0}", message));

                case ErrorCodes.ElementNotSelected:
                    throw new NotSupportedException(
                            String.Format("The element appears to be unselectable: {0}", message));

                case ErrorCodes.NoSuchDocument:
                    throw new NoSuchElementException(message + " (no document found)");

                case ErrorCodes.Timeout:
                    throw new TimeoutException("The driver reported that the command timed out. There may "
                                                    + "be several reasons for this. Check that the destination"
                                                    + "site is in IE's 'Trusted Sites' (accessed from Tools->"
                                                    + "Internet Options in the 'Security' tab) If it is a "
                                                    + "trusted site, then the request may have taken more than"
                                                    + "a minute to finish.");

                case ErrorCodes.NoSuchWindow:
                    throw new NoSuchWindowException(message);

                default:
                    throw new InvalidOperationException(String.Format("{0} ({1})", message, errorCode));
            }
        }

    }
}
