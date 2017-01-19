using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace OpenQA.Selenium.Interactions
{
    /// <summary>
    /// Represents a single interaction for a given input device.
    /// </summary>
    internal abstract class Interaction
    {
        private InputDevice sourceDevice;

        protected Interaction(InputDevice sourceDevice)
        {
            if (sourceDevice == null)
            {
                throw new ArgumentNullException("sourceDevice", "Source device cannot be null");
            }

            this.sourceDevice = sourceDevice;
        }

        public InputDevice SourceDevice
        {
            get { return this.sourceDevice; }
        }

        /// <summary>
        /// Returns a value for this action that can be transmitted across the wire to a remote end.
        /// </summary>
        /// <returns>A <see cref="Dictionary{TKey, TValue}"/> representing this action.</returns>
        public abstract Dictionary<string, object> ToDictionary();

        public virtual bool IsValidFor(InputDeviceKind sourceDeviceKind)
        {
            return sourceDevice.DeviceKind == sourceDeviceKind;
        }
    }
}
