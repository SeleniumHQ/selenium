// <copyright file="WebDriverError.cs" company="Selenium Committers">
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

using System;
using System.Collections.Generic;

namespace OpenQA.Selenium;

/// <summary>
/// Represents an error condition from a remote end using the W3C specification
/// dialect of the wire protocol.
/// </summary>
internal static class WebDriverError
{
    /// <summary>
    /// Represents the element click intercepted error.
    /// </summary>
    public const string ElementClickIntercepted = "element click intercepted";

    /// <summary>
    /// Represents the element not interactable error.
    /// </summary>
    public const string ElementNotInteractable = "element not interactable";

    /// <summary>
    /// Represents the insecure certificate error.
    /// </summary>
    public const string InsecureCertificate = "insecure certificate";

    /// <summary>
    /// Represents the invalid argument error.
    /// </summary>
    public const string InvalidArgument = "invalid argument";

    /// <summary>
    /// Represents the invalid cookie domain error.
    /// </summary>
    public const string InvalidCookieDomain = "invalid cookie domain";

    /// <summary>
    /// Represents the invalid element state error.
    /// </summary>
    public const string InvalidElementState = "invalid element state";

    /// <summary>
    /// Represents the invalid selector error.
    /// </summary>
    public const string InvalidSelector = "invalid selector";

    /// <summary>
    /// Represents the invalid session ID error.
    /// </summary>
    public const string InvalidSessionId = "invalid session id";

    /// <summary>
    /// Represents the unhandled JavaScript error.
    /// </summary>
    public const string JavaScriptError = "javascript error";

    /// <summary>
    /// Represents the move target out of bounds error.
    /// </summary>
    public const string MoveTargetOutOfBounds = "move target out of bounds";

    /// <summary>
    /// Represents the no such alert error.
    /// </summary>
    public const string NoSuchAlert = "no such alert";

    /// <summary>
    /// Represents the no such cookie error.
    /// </summary>
    public const string NoSuchCookie = "no such cookie";

    /// <summary>
    /// Represents the no such element error.
    /// </summary>
    public const string NoSuchElement = "no such element";

    /// <summary>
    /// Represents the no such alert frame.
    /// </summary>
    public const string NoSuchFrame = "no such frame";

    /// <summary>
    /// Represents the no such alert window.
    /// </summary>
    public const string NoSuchWindow = "no such window";

    /// <summary>
    /// Represents the no such shadow root error.
    /// </summary>
    public const string NoSuchShadowRoot = "no such shadow root";

    /// <summary>
    /// Represents the script timeout error.
    /// </summary>
    public const string ScriptTimeout = "script timeout";

    /// <summary>
    /// Represents the session not created error.
    /// </summary>
    public const string SessionNotCreated = "session not created";

    /// <summary>
    /// Represents the stale element reference error.
    /// </summary>
    public const string StaleElementReference = "stale element reference";

    /// <summary>
    /// Represents the detached shadow root error.
    /// </summary>
    public const string DetachedShadowRoot = "detached shadow root";

    /// <summary>
    /// Represents the timeout error.
    /// </summary>
    public const string Timeout = "timeout";

    /// <summary>
    /// Represents the unable to set cookie error.
    /// </summary>
    public const string UnableToSetCookie = "unable to set cookie";

    /// <summary>
    /// Represents the unable to capture screen error.
    /// </summary>
    public const string UnableToCaptureScreen = "unable to capture screen";

    /// <summary>
    /// Represents the unexpected alert open error.
    /// </summary>
    public const string UnexpectedAlertOpen = "unexpected alert open";

    /// <summary>
    /// Represents the unknown command error.
    /// </summary>
    public const string UnknownCommand = "unknown command";

    /// <summary>
    /// Represents an unknown error.
    /// </summary>
    public const string UnknownError = "unknown error";

    /// <summary>
    /// Represents the unknown method error.
    /// </summary>
    public const string UnknownMethod = "unknown method";

    /// <summary>
    /// Represents the unsupported operation error.
    /// </summary>
    public const string UnsupportedOperation = "unsupported operation";

    private static readonly Dictionary<string, WebDriverResult> resultMap = new Dictionary<string, WebDriverResult>
    {
        { ElementClickIntercepted, WebDriverResult.ElementClickIntercepted },
        { ElementNotInteractable, WebDriverResult.ElementNotInteractable },
        { InsecureCertificate, WebDriverResult.InsecureCertificate },
        { InvalidArgument, WebDriverResult.InvalidArgument },
        { InvalidCookieDomain, WebDriverResult.InvalidCookieDomain },
        { InvalidElementState, WebDriverResult.InvalidElementState },
        { InvalidSelector, WebDriverResult.InvalidSelector },
        { InvalidSessionId, WebDriverResult.NoSuchDriver },
        { JavaScriptError, WebDriverResult.UnexpectedJavaScriptError },
        { MoveTargetOutOfBounds, WebDriverResult.MoveTargetOutOfBounds },
        { NoSuchAlert, WebDriverResult.NoAlertPresent },
        { NoSuchCookie, WebDriverResult.NoSuchCookie },
        { NoSuchElement, WebDriverResult.NoSuchElement },
        { NoSuchFrame, WebDriverResult.NoSuchFrame },
        { NoSuchWindow, WebDriverResult.NoSuchWindow },
        { NoSuchShadowRoot, WebDriverResult.NoSuchShadowRoot },
        { ScriptTimeout, WebDriverResult.AsyncScriptTimeout },
        { SessionNotCreated, WebDriverResult.SessionNotCreated },
        { StaleElementReference, WebDriverResult.ObsoleteElement },
        { DetachedShadowRoot, WebDriverResult.DetachedShadowRoot },
        { Timeout, WebDriverResult.Timeout },
        { UnableToSetCookie, WebDriverResult.UnableToSetCookie },
        { UnableToCaptureScreen, WebDriverResult.UnableToCaptureScreen },
        { UnexpectedAlertOpen, WebDriverResult.UnexpectedAlertOpen },
        { UnknownCommand, WebDriverResult.UnknownCommand },
        { UnknownError, WebDriverResult.UnknownError },
        { UnknownMethod, WebDriverResult.UnknownMethod },
        { UnsupportedOperation, WebDriverResult.UnsupportedOperation }
    };

    /// <summary>
    /// Converts a string error to a <see cref="WebDriverResult"/> value.
    /// </summary>
    /// <param name="error">The error string to convert.</param>
    /// <returns>The converted <see cref="WebDriverResult"/> value.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="error"/> is <see langword="null"/>.</exception>
    public static WebDriverResult ResultFromError(string error)
    {
        if (!resultMap.TryGetValue(error, out WebDriverResult result))
        {
            return WebDriverResult.UnsupportedOperation;
        }

        return result;
    }
}
