using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Firefox
{
    /// <summary>
    /// Defines the interface by which a driver connects to the WebDriver extension.
    /// </summary>
    internal interface IExtensionConnection : ICommandExecutor
    {
        /// <summary>
        /// Starts the connection to the extension.
        /// </summary>
        void Start();

        /// <summary>
        /// Closes the connection to the extension.
        /// </summary>
        void Quit();
    }
}
