using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Firefox
{
    /// <summary>
    /// Defines the interface by which a driver connects to the WebDriver extension.
    /// </summary>
    internal interface IExtensionConnection : IDisposable
    {
        /// <summary>
        /// Gets a value indicating whether the driver is connected to the extension.
        /// </summary>
        bool IsConnected { get; }

        /// <summary>
        /// Sends a message to the extension and waits for a response.
        /// </summary>
        /// <param name="throwOnFailure">The <see cref="System.Type"/> of object to instantiate
        /// if the command fails.</param>
        /// <param name="command">The <see cref="Command"/> to execute.</param>
        /// <returns>A <see cref="Response"/> that contains the data returned by the command.</returns>
        Response SendMessageAndWaitForResponse(Type throwOnFailure, Command command);

        /// <summary>
        /// Closes the connection to the extension.
        /// </summary>
        void Quit();
    }
}
