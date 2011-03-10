using System.Collections.Generic;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Capabilities of the browser that you are going to use
    /// </summary>
    public interface ICapabilities
    {
        /// <summary>
        /// Gets the browser name
        /// </summary>
        string BrowserName { get; }

        /// <summary>
        /// Gets the platform
        /// </summary>
        Platform Platform { get; }

        /// <summary>
        /// Gets the browser version
        /// </summary>
        string Version { get; }

        /// <summary>
        /// Gets a value indicating whether the browser is JavaScript enabled
        /// </summary>
        bool IsJavaScriptEnabled { get; }

        /// <summary>
        /// Gets a value indicating whether the browser has a given capability.
        /// </summary>
        /// <param name="capability">The capability ot get.</param>
        /// <returns>Returns <see langword="true"/> if the browser has the capability; otherwise, <see langword="false"/>.</returns>
        bool HasCapability(string capability);

        /// <summary>
        /// Gets a capability of the browser.
        /// </summary>
        /// <param name="capability">The capability to get.</param>
        /// <returns>An object associated with the capability, or <see langword="null"/>
        /// if the capability is not set on the browser.</returns>
        object GetCapability(string capability);
    }
}
