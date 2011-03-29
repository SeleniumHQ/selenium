using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides types of capabilities for the DesiredCapabilities object.
    /// </summary>
    public static class CapabilityType
    {
        /// <summary>
        /// Capability name used for the browser name.
        /// </summary>
        public static readonly string BrowserName = "browserName";

        /// <summary>
        /// Capability name used for the browser platform.
        /// </summary>
        public static readonly string Platform = "platform";

        /// <summary>
        /// Capability name used for the browser version.
        /// </summary>
        public static readonly string Version = "version";

        /// <summary>
        /// Capability name used to indicate whether JavaScript is enabled for the browser.
        /// </summary>
        public static readonly string IsJavaScriptEnabled = "javascriptEnabled";

        /// <summary>
        /// Capability name used to indicate whether the browser can take screenshots.
        /// </summary>
        public static readonly string TakesScreenshot = "takesScreenshot";

        /// <summary>
        /// Capability name used to indicate whether the browser can handle alerts.
        /// </summary>
        public static readonly string HandlesAlerts = "handlesAlerts";

        /// <summary>
        /// Capability name used to indicate whether the browser can find elements via CSS selectors.
        /// </summary>
        public static readonly string SupportsFindingByCss = "cssSelectorsEnabled";

        /// <summary>
        /// Capability name used for the browser proxy.
        /// </summary>
        public static readonly string Proxy = "proxy";

        /// <summary>
        /// Capability name used to indicate whether the browser supports rotation.
        /// </summary>
        public static readonly string Rotatable = "rotatable";
    }
}
