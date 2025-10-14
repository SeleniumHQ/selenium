// <copyright file="JavaScriptCallbackExecutedEventArgs.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium;

/// <summary>
/// Provides data for the JavaScriptCallbackExecuted event.
/// </summary>
public class JavaScriptCallbackExecutedEventArgs : EventArgs
{
    /// <summary>
    /// Initializes a new instance of the <see cref="JavaScriptCallbackExecutedEventArgs"/> type.
    /// </summary>
    /// <param name="scriptPayload">The payload sent from the JavaScript callback.</param>
    /// <param name="bindingName">The binding name of the JavaScript callback that was execute.</param>
    public JavaScriptCallbackExecutedEventArgs(string scriptPayload, string bindingName)
    {
        this.ScriptPayload = scriptPayload;
        this.BindingName = bindingName;
    }

    /// <summary>
    /// Gets or sets the payload sent from the JavaScript callback.
    /// </summary>
    public string ScriptPayload { get; set; }

    /// <summary>
    /// Gets or sets the binding name of the JavaScript callback that was execute.
    /// </summary>
    public string BindingName { get; set; }
}
