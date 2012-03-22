// <copyright file="FrameType.cs" company="WebDriver Committers">
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

namespace OpenQA.Selenium.Safari.Internal
{
    /// <summary>
    /// Enumerates the types of frames described by the WebSocket protocol.
    /// </summary>
    public enum FrameType
    {
        /// <summary>
        /// Indicates a continuation frame.
        /// </summary>
        Continuation,

        /// <summary>
        /// Indicates a text frame.
        /// </summary>
        Text,

        /// <summary>
        /// Indicates a binary frame.
        /// </summary>
        Binary,

        /// <summary>
        /// Indicates a close frame.
        /// </summary>
        Close = 8,

        /// <summary>
        /// Indicates a ping frame.
        /// </summary>
        Ping = 9,

        /// <summary>
        /// Indicates a ping response frame.
        /// </summary>
        Pong = 10,
    }
}
