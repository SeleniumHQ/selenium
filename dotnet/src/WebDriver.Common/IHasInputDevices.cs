using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium.Interactions;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Provides access to input devices for advanced user interactions.
    /// </summary>
    public interface IHasInputDevices
    {
        /// <summary>
        /// Gets an <see cref="IKeyboard"/> object for sending keystrokes to the browser.
        /// </summary>
        IKeyboard Keyboard { get; }

        /// <summary>
        /// Gets an <see cref="IMouse"/> object for sending mouse commands to the browser.
        /// </summary>
        IMouse Mouse { get; }

        /// <summary>
        /// Gets an <see cref="IActionSequenceGenerator"/> object for building actions to send to the browser.
        /// </summary>
        IActionSequenceBuilder ActionBuilder { get; }
    }
}
