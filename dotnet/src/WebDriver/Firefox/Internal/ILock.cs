// <copyright file="ILock.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2011 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
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
using System.Text;

namespace OpenQA.Selenium.Firefox.Internal
{
    /// <summary>
    /// Defines the interface through which the mutex port for establishing communication 
    /// with the WebDriver extension can be locked.
    /// </summary>
    internal interface ILock : IDisposable
    {
        /// <summary>
        /// Locks the mutex port.
        /// </summary>
        /// <param name="timeoutInMilliseconds">The amount of time (in milliseconds) to wait for 
        /// the mutex port to become available.</param>
        void LockObject(long timeoutInMilliseconds);

        /// <summary>
        /// Unlocks the mutex port.
        /// </summary>
        void UnlockObject();
    }
}
