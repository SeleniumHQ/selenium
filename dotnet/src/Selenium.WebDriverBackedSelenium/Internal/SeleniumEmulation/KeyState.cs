using System;
using System.Collections.Generic;
using System.Text;

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
