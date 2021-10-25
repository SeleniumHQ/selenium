// <copyright file="Interaction.cs" company="WebDriver Committers">
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

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace OpenQA.Selenium.Interactions
{
    /// <summary>
    /// Represents a single interaction for a given input device.
    /// </summary>
    public abstract class Interaction
    {
        private InputDevice sourceDevice;

        /// <summary>
        /// Initializes a new instance of the <see cref="Interaction"/> class.
        /// </summary>
        /// <param name="sourceDevice">The input device which performs this action.</param>
        protected Interaction(InputDevice sourceDevice)
        {
            if (sourceDevice == null)
            {
                throw new ArgumentNullException(nameof(sourceDevice), "Source device cannot be null");
            }

            this.sourceDevice = sourceDevice;
        }

        /// <summary>
        /// Gets the device for which this action is intended.
        /// </summary>
        public InputDevice SourceDevice
        {
            get { return this.sourceDevice; }
        }

        /// <summary>
        /// Returns a value for this action that can be transmitted across the wire to a remote end.
        /// </summary>
        /// <returns>A <see cref="Dictionary{TKey, TValue}"/> representing this action.</returns>
        public abstract Dictionary<string, object> ToDictionary();

        /// <summary>
        /// Gets a value indicating whether this action is valid for the specified type of input device.
        /// </summary>
        /// <param name="sourceDeviceKind">The type of device to check.</param>
        /// <returns><see langword="true"/> if the action is valid for the specified type of input device;
        /// otherwise, <see langword="false"/>.</returns>
        public virtual bool IsValidFor(InputDeviceKind sourceDeviceKind)
        {
            return this.sourceDevice.DeviceKind == sourceDeviceKind;
        }
    }
}
