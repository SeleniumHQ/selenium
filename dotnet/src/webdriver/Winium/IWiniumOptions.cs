// <copyright file="IWiniumOptions.cs" company="Microsoft">
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

namespace OpenQA.Selenium.Winium
{
    /// <summary>
    /// Defines the interface to manage options specific to <see cref="WiniumDriver"/>
    /// </summary>
    public interface IWiniumOptions
    {
        /// <summary>
        /// Convert options to DesiredCapabilities for one of Winium Drivers 
        /// </summary>
        /// <returns>The DesiredCapabilities for Winium Driver with these options.</returns>
        ICapabilities ToCapabilities();
    }
}
