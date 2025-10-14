// <copyright file="BindingCalledEventArgs.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.DevTools;

/// <summary>
/// Event arguments present when the BindingCalled event is raised.
/// </summary>
public class BindingCalledEventArgs : EventArgs
{
    /// <summary>
    /// Initializes a new instance of the <see cref="BindingCalledEventArgs"/> type.
    /// </summary>
    /// <param name="executionContextId">The execution ID of the call to the binding.</param>
    /// <param name="name">The name of the call to the binding.</param>
    /// <param name="payload">The payload of the call to the binding.</param>
    public BindingCalledEventArgs(long executionContextId, string name, string payload)
    {
        this.ExecutionContextId = executionContextId;
        this.Name = name;
        this.Payload = payload;
    }

    /// <summary>
    /// Gets the execution context ID of the call to the binding.
    /// </summary>
    public long ExecutionContextId { get; }

    /// <summary>
    /// Gets the name of the call to the binding.
    /// </summary>
    public string Name { get; }

    /// <summary>
    /// Gets the payload of the call to the binding.
    /// </summary>
    public string Payload { get; }
}
