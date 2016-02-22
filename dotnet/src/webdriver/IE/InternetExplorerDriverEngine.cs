// <copyright file="InternetExplorerDriverEngine.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Represents the valid values for driver engine available with the IEDriverServer.exe.
    /// </summary>
    public enum InternetExplorerDriverEngine
    {
        /// <summary>
        /// Represents the Legacy value, forcing the driver to use only the open-source
        /// driver engine implementation.
        /// </summary>
        Legacy,

        /// <summary>
        /// Represents the AutoDetect value, instructing the driver to use the vendor-provided
        /// driver engine implementation, if available, falling back to the open-source
        /// implementation, if it is not available.
        /// </summary>
        AutoDetect,

        /// <summary>
        /// Represents the Vendor value, instructing the driver to use the vendor-provided
        /// driver engine implementation, and throwing an exception if it is not available.
        /// </summary>
        Vendor
    }
}
