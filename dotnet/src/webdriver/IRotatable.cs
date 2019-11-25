// <copyright file="IRotatable.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium
{
    /// <summary>
    /// Represents rotation of the browser view for orientation-sensitive devices.
    /// When using this with a real device, the device should not be moved so that
    /// the built-in sensors do not interfere.
    /// </summary>
    public interface IRotatable
    {
        /// <summary>
        /// Gets or sets the screen orientation of the browser on the device.
        /// </summary>
        ScreenOrientation Orientation { get; set; }
    }
}
