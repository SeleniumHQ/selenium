// <copyright file="WebDriverResult.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium
{
    /// <summary>
    /// Specifies return values for actions in the driver.
    /// </summary>
    public enum WebDriverResult
    {
        /// <summary>
        /// The action was successful.
        /// </summary>
        Success = 0,

        /// <summary>
        /// The index specified for the action was out of the acceptable range.
        /// </summary>
        IndexOutOfBounds = 1,

        /// <summary>
        /// No collection was specified.
        /// </summary>
        NoCollection = 2,

        /// <summary>
        /// No string was specified.
        /// </summary>
        NoString = 3,

        /// <summary>
        /// No string length was specified.
        /// </summary>
        NoStringLength = 4,

        /// <summary>
        /// No string wrapper was specified.
        /// </summary>
        NoStringWrapper = 5,

        /// <summary>
        /// No driver matching the criteria exists.
        /// </summary>
        NoSuchDriver = 6,

        /// <summary>
        /// No element matching the criteria exists.
        /// </summary>
        NoSuchElement = 7,

        /// <summary>
        /// No frame matching the criteria exists.
        /// </summary>
        NoSuchFrame = 8,

        /// <summary>
        /// The functionality is not supported.
        /// </summary>
        UnknownCommand = 9,

        /// <summary>
        /// The specified element is no longer valid.
        /// </summary>
        ObsoleteElement = 10,

        /// <summary>
        /// The specified element is not displayed.
        /// </summary>
        ElementNotDisplayed = 11,

        /// <summary>
        /// The specified element is not enabled.
        /// </summary>
        InvalidElementState = 12,

        /// <summary>
        /// An unhandled error occurred.
        /// </summary>
        UnhandledError = 13,

        /// <summary>
        /// An error occurred, but it was expected.
        /// </summary>
        ExpectedError = 14,

        /// <summary>
        /// The specified element is not selected.
        /// </summary>
        ElementNotSelectable = 15,

        /// <summary>
        /// No document matching the criteria exists.
        /// </summary>
        NoSuchDocument = 16,

        /// <summary>
        /// An unexpected JavaScript error occurred.
        /// </summary>
        UnexpectedJavaScriptError = 17,

        /// <summary>
        /// No result is available from the JavaScript execution.
        /// </summary>
        NoScriptResult = 18,

        /// <summary>
        /// The result from the JavaScript execution is not recognized.
        /// </summary>
        XPathLookupError = 19,

        /// <summary>
        /// No collection matching the criteria exists.
        /// </summary>
        NoSuchCollection = 20,

        /// <summary>
        /// A timeout occurred.
        /// </summary>
        Timeout = 21,

        /// <summary>
        /// A null pointer was received.
        /// </summary>
        NullPointer = 22,

        /// <summary>
        /// No window matching the criteria exists.
        /// </summary>
        NoSuchWindow = 23,

        /// <summary>
        /// An illegal attempt was made to set a cookie under a different domain than the current page.
        /// </summary>
        InvalidCookieDomain = 24,

        /// <summary>
        /// A request to set a cookie's value could not be satisfied.
        /// </summary>
        UnableToSetCookie = 25,

        /// <summary>
        /// An alert was found open unexpectedly.
        /// </summary>
        UnexpectedAlertOpen = 26,

        /// <summary>
        /// A request was made to switch to an alert, but no alert is currently open.
        /// </summary>
        NoAlertPresent = 27,

        /// <summary>
        /// An asynchronous JavaScript execution timed out.
        /// </summary>
        AsyncScriptTimeout = 28,

        /// <summary>
        /// The coordinates of the element are invalid.
        /// </summary>
        InvalidElementCoordinates = 29,

        /// <summary>
        /// The selector used (CSS/XPath) was invalid.
        /// </summary>
        InvalidSelector = 32,

        /// <summary>
        /// A session was not created by the driver
        /// </summary>
        SessionNotCreated = 33,

        /// <summary>
        /// The requested move was outside the active view port
        /// </summary>
        MoveTargetOutOfBounds = 34,

        /// <summary>
        /// The XPath selector was invalid.
        /// </summary>
        InvalidXPathSelector = 51,

        /// <summary>
        /// An insecure SSl certificate was specified.
        /// </summary>
        InsecureCertificate = 59,

        /// <summary>
        /// The element was not interactable
        /// </summary>
        ElementNotInteractable = 60,

        /// <summary>
        /// An invalid argument was passed to the command.
        /// </summary>
        InvalidArgument = 61,

        /// <summary>
        /// No cookie was found matching the name requested.
        /// </summary>
        NoSuchCookie = 62,

        /// <summary>
        /// The driver was unable to capture the screen.
        /// </summary>
        UnableToCaptureScreen = 63,

        /// <summary>
        /// The click on the element was intercepted by a different element.
        /// </summary>
        ElementClickIntercepted = 64,

        /// <summary>
        /// The element does not have a shadow root.
        /// </summary>
        NoSuchShadowRoot = 65
    }
}
