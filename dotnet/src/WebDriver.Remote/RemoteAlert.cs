using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Defines the interface through which the user can manipulate JavaScript alerts.
    /// </summary>
    internal class RemoteAlert : IAlert
    {
        private RemoteWebDriver driver;

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteAlert"/> class.
        /// </summary>
        /// <param name="driver">The <see cref="RemoteWebDriver"/> for which the alerts will be managed.</param>
        public RemoteAlert(RemoteWebDriver driver)
        {
            this.driver = driver;
        }

        #region IAlert Members
        /// <summary>
        /// Gets the text of the alert.
        /// </summary>
        public string Text
        {
            get
            {
                Response commandResponse = this.driver.InternalExecute(DriverCommand.GetAlertText, null);
                return commandResponse.Value.ToString();
            }
        }

        /// <summary>
        /// Dismisses the alert.
        /// </summary>
        public void Dismiss()
        {
            this.driver.InternalExecute(DriverCommand.DismissAlert, null);
        }

        /// <summary>
        /// Accepts the alert.
        /// </summary>
        public void Accept()
        {
            this.driver.InternalExecute(DriverCommand.AcceptAlert, null);
        }

        /// <summary>
        /// Sends keys to the alert.
        /// </summary>
        /// <param name="keysToSend">The keystrokes to send.</param>
        public void SendKeys(string keysToSend)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("text", keysToSend);
            this.driver.InternalExecute(DriverCommand.SetAlertValue, parameters);
        }
        #endregion
    }
}
