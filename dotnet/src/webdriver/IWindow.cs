// <copyright file="IWindow.cs" company="WebDriver Committers">
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

using System.Drawing;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Provides methods for getting and setting the size and position of the browser window.
    /// </summary>
    public interface IWindow
    {
        /// <summary>
        /// Gets or sets the position of the browser window relative to the upper-left corner of the screen.
        /// </summary>
        /// <remarks>When setting this property, it should act as the JavaScript window.moveTo() method.</remarks>
        Point Position { get; set; }

        /// <summary>
        /// Gets or sets the size of the outer browser window, including title bars and window borders.
        /// </summary>
        /// <remarks>When setting this property, it should act as the JavaScript window.resizeTo() method.</remarks>
        Size Size { get; set; }

        /// <summary>
        /// Maximizes the current window if it is not already maximized.
        /// </summary>
        void Maximize();

        /// <summary>
        /// Minimizes the current window if it is not already minimized.
        /// </summary>
        void Minimize();

        /// <summary>
        /// Sets the current window to full screen if it is not already in that state.
        /// </summary>
        void FullScreen();
    }
}
