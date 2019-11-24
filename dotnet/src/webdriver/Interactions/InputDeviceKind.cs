// <copyright file="InputDeviceKind.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Interactions
{
    /// <summary>
    /// Enumerated values for the kinds of devices available.
    /// </summary>
    public enum InputDeviceKind
    {
        /// <summary>
        /// Represents the null device.
        /// </summary>
        None,

        /// <summary>
        /// Represents a key-based device, primarily for entering text.
        /// </summary>
        Key,

        /// <summary>
        /// Represents a pointer-based device, such as a mouse, pen, or stylus.
        /// </summary>
        Pointer
    }
}
