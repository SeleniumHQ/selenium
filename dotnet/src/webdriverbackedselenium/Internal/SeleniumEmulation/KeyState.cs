// <copyright file="KeyState.cs" company="WebDriver Committers">
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


namespace Selenium.Internal.SeleniumEmulation
{
    /// <summary>
    /// Defines the state of modifier keys.
    /// </summary>
    internal class KeyState
    {
        private bool altKeyDown;
        private bool controlKeyDown;
        private bool shiftKeyDown;
        private bool metaKeyDown;

        /// <summary>
        /// Gets or sets a value indicating whether the Alt key is down.
        /// </summary>
        public bool AltKeyDown
        {
            get { return this.altKeyDown; }
            set { this.altKeyDown = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether the Control key is down.
        /// </summary>
        public bool ControlKeyDown
        {
            get { return this.controlKeyDown; }
            set { this.controlKeyDown = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether the Shift key is down.
        /// </summary>
        public bool ShiftKeyDown
        {
            get { return this.shiftKeyDown; }
            set { this.shiftKeyDown = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether the Meta key is down.
        /// </summary>
        public bool MetaKeyDown
        {
            get { return this.metaKeyDown; }
            set { this.metaKeyDown = value; }
        }
    }
}
