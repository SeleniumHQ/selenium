namespace OpenQA.Selenium.Remote
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
    }
}
