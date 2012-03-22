// <copyright file="ReceivedEventArgs.cs" company="WebDriver Committers">
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
    /// Provides arguments for handling the event for when data is received.
    /// </summary>
    public class ReceivedEventArgs : EventArgs
    {
        private int bytesRead;
        private byte[] buffer;

        /// <summary>
        /// Initializes a new instance of the <see cref="ReceivedEventArgs"/> class.
        /// </summary>
        /// <param name="bytesRead">The number of bytes read.</param>
        /// <param name="buffer">A byte array containing the data read.</param>
        public ReceivedEventArgs(int bytesRead, byte[] buffer)
        {
            this.bytesRead = bytesRead;
            this.buffer = buffer;
        }

        /// <summary>
        /// Gets the number of bytes read.
        /// </summary>
        public int BytesRead
        {
            get { return this.bytesRead; }
        }

        /// <summary>
        /// Gets the data read by the connection.
        /// </summary>
        public byte[] Buffer
        {
            get { return this.buffer; }
        }
    }
}
