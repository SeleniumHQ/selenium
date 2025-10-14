// <copyright file="WebDriverResult.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

namespace OpenQA.Selenium;

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
    /// Occurs if the given <see href="https://www.w3.org/TR/webdriver2/#dfn-session-id">session id</see> is not in the list of <see href="https://www.w3.org/TR/webdriver2/#dfn-active-sessions">active sessions</see>, meaning the session either does not exist or that it's not active.
    /// </summary>
    NoSuchDriver = 6,

    /// <summary>
    /// An element could not be located on the page using the given search parameters.
    /// </summary>
    NoSuchElement = 7,

    /// <summary>
    /// A command to switch to a frame could not be satisfied because the frame could not be found.
    /// </summary>
    NoSuchFrame = 8,

    /// <summary>
    /// A command could not be executed because the <see href="https://www.w3.org/TR/webdriver2/#dfn-remote-ends">remote end</see> is not aware of it.
    /// </summary>
    UnknownCommand = 9,

    /// <summary>
    /// A command failed because the referenced element is no longer attached to the DOM.
    /// </summary>
    ObsoleteElement = 10,

    /// <summary>
    /// A command could not be completed because the element is in an invalid state, e.g. attempting to <see href="https://www.w3.org/TR/webdriver2/#dfn-element-clear">clear</see> an element that isn't both <see href="https://www.w3.org/TR/webdriver2/#dfn-editable">editable</see> and <see href="https://www.w3.org/TR/webdriver2/#dfn-resettable-elements">resettable</see>.
    /// </summary>
    InvalidElementState = 12,

    /// <summary>
    /// An unknown error occurred in the <see href="https://www.w3.org/TR/webdriver2/#dfn-remote-ends">remote end</see> while processing the command.
    /// </summary>
    UnknownError = 13,

    /// <summary>
    /// An error occurred while executing JavaScript supplied by the user.
    /// </summary>
    UnexpectedJavaScriptError = 17,

    /// <summary>
    /// An operation did not complete before its timeout expired.
    /// </summary>
    Timeout = 21,

    /// <summary>
    /// A command to switch to a window could not be satisfied because the window could not be found.
    /// </summary>
    NoSuchWindow = 23,

    /// <summary>
    /// An illegal attempt was made to set a cookie under a different domain than the current page.
    /// </summary>
    InvalidCookieDomain = 24,

    /// <summary>
    /// A command to set a cookie's value could not be satisfied.
    /// </summary>
    UnableToSetCookie = 25,

    /// <summary>
    /// A modal dialog was open, blocking this operation.
    /// </summary>
    UnexpectedAlertOpen = 26,

    /// <summary>
    /// An attempt was made to operate on a modal dialog when one was not open.
    /// </summary>
    NoAlertPresent = 27,

    /// <summary>
    /// A script did not complete before its timeout expired.
    /// </summary>
    AsyncScriptTimeout = 28,

    /// <summary>
    /// Argument was an invalid selector.
    /// </summary>
    InvalidSelector = 32,

    /// <summary>
    /// A new <see href="https://www.w3.org/TR/webdriver2/#dfn-sessions">session</see> could not be created.
    /// </summary>
    SessionNotCreated = 33,

    /// <summary>
    /// The target for mouse interaction is not in the browser's viewport and cannot be brought into that viewport.
    /// </summary>
    MoveTargetOutOfBounds = 34,

    /// <summary>
    /// Navigation caused the user agent to hit a certificate warning, which is usually the result of an expired or invalid TLS certificate.
    /// </summary>
    InsecureCertificate = 59,

    /// <summary>
    /// A command could not be completed because the element is not <see href="https://www.w3.org/TR/webdriver2/#dfn-pointer-interactable">pointer</see>- or <see href="https://www.w3.org/TR/webdriver2/#dfn-keyboard-interactable">keyboard</see> interactable.
    /// </summary>
    ElementNotInteractable = 60,

    /// <summary>
    /// The arguments passed to a command are either invalid or malformed.
    /// </summary>
    InvalidArgument = 61,

    /// <summary>
    /// No cookie matching the given path name was found amongst the <see href="https://www.w3.org/TR/webdriver2/#dfn-associated-cookies">associated cookies</see> of session's current browsing context's active document.
    /// </summary>
    NoSuchCookie = 62,

    /// <summary>
    /// A screen capture was made impossible.
    /// </summary>
    UnableToCaptureScreen = 63,

    /// <summary>
    /// The <see href="https://www.w3.org/TR/webdriver2/#dfn-element-click">Element Click</see> command could not be completed because the element receiving the events is <see href="https://www.w3.org/TR/webdriver2/#dfn-obscuring">obscuring</see> the element that was requested clicked.
    /// </summary>
    ElementClickIntercepted = 64,

    /// <summary>
    /// The element does not have a shadow root.
    /// </summary>
    NoSuchShadowRoot = 65,

    /// <summary>
    /// The referenced shadow root is no longer attached to the DOM.
    /// </summary>
    DetachedShadowRoot = 66,

    /// <summary>
    /// The requested command matched a known URL but did not match any method for that URL.
    /// </summary>
    UnknownMethod = 67,

    /// <summary>
    /// Indicates that a command that should have executed properly cannot be supported for some reason.
    /// </summary>
    UnsupportedOperation = 68,
}
