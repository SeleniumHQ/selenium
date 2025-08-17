// <copyright file="IActionExecutor.cs" company="Selenium Committers">
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

using OpenQA.Selenium.Interactions;
using System;
using System.Collections.Generic;

namespace OpenQA.Selenium;

/// <summary>
/// Interface allowing execution of W3C Specification-compliant actions.
/// </summary>
public interface IActionExecutor
{
    /// <summary>
    /// Gets a value indicating whether this object is a valid action executor.
    /// </summary>
    bool IsActionExecutor { get; }

    /// <summary>
    /// Performs the specified list of actions with this action executor.
    /// </summary>
    /// <param name="actionSequenceList">The list of action sequences to perform.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="actionSequenceList"/> is <see langword="null"/>.</exception>
    /// <exception cref="ArgumentException">If an element in <paramref name="actionSequenceList"/> is <see langword="null"/>.</exception>
    void PerformActions(IList<ActionSequence> actionSequenceList);

    /// <summary>
    /// Resets the input state of the action executor.
    /// </summary>
    void ResetInputState();
}
