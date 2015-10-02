﻿// <copyright file="ILocationContext.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.HTML5
{
    public interface ILocationContext
    {
        /// <summary>
        /// Gets the physical location of the browser.
        /// </summary>
        /// <returns>A <see cref="Location">location</see> containing the location information. Returns null if the location is not available</returns>
        Location Location();

        /// <summary>
        /// Sets the physical location.
        /// </summary>
        /// <param name="location">A <see cref="Location">location</see> containing the new location information</param>
        void SetLocation(Location location);
    }
}
