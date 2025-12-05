// <copyright file="StackTraceElement.cs" company="Selenium Committers">
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
using System.Globalization;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium;

/// <summary>
/// Gives properties to get a stack trace
/// </summary>
public class StackTraceElement
{
    private string fileName = string.Empty;
    private string className = string.Empty;
    private int lineNumber;
    private string methodName = string.Empty;

    /// <summary>
    /// Initializes a new instance of the <see cref="StackTraceElement"/> class.
    /// </summary>
    public StackTraceElement()
    {
    }

    /// <summary>
    /// Initializes a new instance of the <see cref="StackTraceElement"/> class using the given property values.
    /// </summary>
    /// <param name="elementAttributes">A <see cref="Dictionary{K, V}"/> containing the names and values for the properties of this <see cref="StackTraceElement"/>.</param>
    public StackTraceElement(Dictionary<string, object?>? elementAttributes)
    {
        if (elementAttributes != null)
        {
            if (elementAttributes.TryGetValue("className", out object? classNameObj))
            {
                string? className = classNameObj?.ToString();
                if (className is not null)
                {
                    this.className = className;
                }
            }

            if (elementAttributes.TryGetValue("methodName", out object? methodNameObj))
            {
                string? methodName = methodNameObj?.ToString();
                if (methodName is not null)
                {
                    this.methodName = methodName;
                }
            }

            if (elementAttributes.TryGetValue("lineNumber", out object? lineNumberObj))
            {
                if (int.TryParse(lineNumberObj?.ToString(), out int line))
                {
                    this.lineNumber = line;
                }
            }

            if (elementAttributes.TryGetValue("fileName", out object? fileNameObj))
            {
                string? fileName = fileNameObj?.ToString();
                if (fileName is not null)
                {
                    this.fileName = fileName;
                }
            }
        }
    }

    /// <summary>
    /// Gets or sets the value of the filename in the stack
    /// </summary>
    [JsonPropertyName("fileName")]
    public string FileName
    {
        get { return this.fileName; }
        set { this.fileName = value; }
    }

    /// <summary>
    /// Gets or sets the value of the Class name in the stack trace
    /// </summary>
    [JsonPropertyName("className")]
    public string ClassName
    {
        get { return this.className; }
        set { this.className = value; }
    }

    /// <summary>
    /// Gets or sets the line number
    /// </summary>
    [JsonPropertyName("lineNumber")]
    public int LineNumber
    {
        get { return this.lineNumber; }
        set { this.lineNumber = value; }
    }

    /// <summary>
    /// Gets or sets the Method name in the stack trace
    /// </summary>
    [JsonPropertyName("methodName")]
    public string MethodName
    {
        get { return this.methodName; }
        set { this.methodName = value; }
    }

    /// <summary>
    /// Gets a string representation of the object.
    /// </summary>
    /// <returns>A string representation of the object.</returns>
    public override string ToString()
    {
        return string.Format(CultureInfo.InvariantCulture, "at {0}.{1} ({2}, {3})", this.className, this.methodName, this.fileName, this.lineNumber);
    }
}
