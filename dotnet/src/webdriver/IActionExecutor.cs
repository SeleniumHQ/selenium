// <copyright file="IActionExecutor.cs" company="WebDriver Committers">
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

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using OpenQA.Selenium.Interactions;

namespace OpenQA.Selenium
{
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
        void PerformActions(IList<ActionSequence> actionSequenceList);

        /// <summary>
        /// Resets the input state of the action executor.
        /// </summary>
        void ResetInputState();
    }
}
