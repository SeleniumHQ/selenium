// <copyright file="BinaryMessageHandledEventArgs.cs" company="WebDriver Committers">
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
    /// Provides arguments for handling the event for receiving a binary message.
    /// </summary>
    public class BinaryMessageHandledEventArgs : EventArgs
    {
        private byte[] data;

        /// <summary>
        /// Initializes a new instance of the <see cref="BinaryMessageHandledEventArgs"/> class.
        /// </summary>
        /// <param name="data">The binary data in the message.</param>
        public BinaryMessageHandledEventArgs(byte[] data)
        {
            this.data = data;
        }

        /// <summary>
        /// Gets the binary data of the message.
        /// </summary>
        public byte[] Data
        {
            get { return this.data; }
        }
    }
}
