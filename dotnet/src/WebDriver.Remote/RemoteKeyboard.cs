using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Defines the interface through which the user can execute advanced keyboard interactions.
    /// </summary>
    internal class RemoteKeyboard : IKeyboard
    {
        private RemoteWebDriver driver;

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteKeyboard"/> class.
        /// </summary>
        /// <param name="driver">The <see cref="RemoteWebDriver"/> for which the keyboard will be managed.</param>
        public RemoteKeyboard(RemoteWebDriver driver)
        {
            this.driver = driver;
        }

        #region IKeyboard Members
        /// <summary>
        /// Sends a sequence of keystrokes to the target.
        /// </summary>
        /// <param name="keySequence">A string representing the keystrokes to send.</param>
        public void SendKeys(string keySequence)
        {
            this.driver.SwitchTo().ActiveElement().SendKeys(keySequence);
        }

        /// <summary>
        /// Presses a key.
        /// </summary>
        /// <param name="keyToPress">The key value representing the key to press.</param>
        /// <remarks>The key value must be one of the values from the <see cref="Keys"/> class.</remarks>
        public void PressKey(string keyToPress)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("value", keyToPress);
            parameters.Add("isdown", true);
            this.driver.InternalExecute(DriverCommand.SendModifierKeyToActiveElement, parameters);
        }

        /// <summary>
        /// Releases a key.
        /// </summary>
        /// <param name="keyToRelease">The key value representing the key to release.</param>
        /// <remarks>The key value must be one of the values from the <see cref="Keys"/> class.</remarks>
        public void ReleaseKey(string keyToRelease)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("value", keyToRelease);
            parameters.Add("isdown", false);
            this.driver.InternalExecute(DriverCommand.SendModifierKeyToActiveElement, parameters);
        }
        #endregion
    }
}
