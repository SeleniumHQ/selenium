// <copyright file="IRequestParser.cs" company="WebDriver Committers">
// Copyright 2007-2012 WebDriver committers
// Copyright 2007-2012 Google Inc.
// Portions copyright 2012 Software Freedom Conservancy
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
using System.Linq;
using System.Text;

namespace OpenQA.Selenium.Safari.Internal
{
    /// <summary>
    /// Provides an interface for parsing requests.
    /// </summary>
    internal interface IRequestParser
    {
        /// <summary>
        /// Parses the specified data into a <see cref="WebSocketHttpRequest"/>.
        /// </summary>
        /// <param name="requestData">The data to be parsed.</param>
        /// <returns>The parsed <see cref="WebSocketHttpRequest"/>.</returns>
        WebSocketHttpRequest Parse(byte[] requestData);

        /// <summary>
        /// Parses the specified data into a <see cref="WebSocketHttpRequest"/> for the given scheme.
        /// </summary>
        /// <param name="requestData">The data to be parsed.</param>
        /// <param name="scheme">The scheme to use in parsing the data.</param>
        /// <returns>The parsed <see cref="WebSocketHttpRequest"/>.</returns>
        WebSocketHttpRequest Parse(byte[] requestData, string scheme);
    }
}
