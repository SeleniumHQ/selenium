// <copyright file="ErrorResponse.cs" company="Selenium Committers">
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

using System.Collections.Generic;

namespace OpenQA.Selenium;

/// <summary>
/// Provides a way to store errors from a response
/// </summary>
public class ErrorResponse
{
    /// <summary>
    /// Initializes a new instance of the <see cref="ErrorResponse"/> class.
    /// </summary>
    public ErrorResponse()
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="ErrorResponse"/> class using the specified values.
    /// </summary>
    /// <param name="responseValue">A <see cref="Dictionary{K, V}"/> containing names and values of
    /// the properties of this <see cref="ErrorResponse"/>.</param>
    public ErrorResponse(Dictionary<string, object?>? responseValue)
    {
        if (responseValue != null)
        {
            if (responseValue.TryGetValue("message", out object? messageObj)
                && messageObj?.ToString() is string message)
            {
                this.Message = message;
            }
            else
            {
                this.Message = "The error did not contain a message.";
            }

            if (responseValue.TryGetValue("screen", out object? screenObj))
            {
                this.Screenshot = screenObj?.ToString();
            }

            if (responseValue.TryGetValue("class", out object? classObj))
            {
                this.ClassName = classObj?.ToString();
            }

            if (responseValue.TryGetValue("stackTrace", out object? stackTraceObj)
                || responseValue.TryGetValue("stacktrace", out stackTraceObj))
            {
                if (stackTraceObj is object?[] stackTraceArray)
                {
                    List<StackTraceElement> stackTraceList = new List<StackTraceElement>();
                    foreach (object? rawStackTraceElement in stackTraceArray)
                    {
                        if (rawStackTraceElement is Dictionary<string, object?> elementAsDictionary)
                        {
                            stackTraceList.Add(new StackTraceElement(elementAsDictionary));
                        }
                    }

                    this.StackTrace = stackTraceList.ToArray();
                }
            }
        }
    }

    /// <summary>
    /// Gets or sets the message from the response
    /// </summary>
    public string Message { get; } = string.Empty;

    /// <summary>
    /// Gets or sets the class name that threw the error
    /// </summary>
    public string? ClassName { get; }

    // TODO: (JimEvans) Change this to return an Image.
    /// <summary>
    /// Gets or sets the screenshot of the error
    /// </summary>
    public string? Screenshot { get; }

    /// <summary>
    /// Gets or sets the stack trace of the error
    /// </summary>
    public StackTraceElement[]? StackTrace { get; }
}
