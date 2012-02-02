using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Class to manage options specific to <see cref="InternetExplorerDriver"/>
    /// </summary>
    /// <example>
    /// <code>
    /// InternetExplorerOptions options = new InternetExplorerOptions();
    /// options.IntroduceInstabilityByIgnoringProtectedModeSettings = true;
    /// </code>
    /// <para></para>
    /// <para>For use with InternetExplorerDriver:</para>
    /// <para></para>
    /// <code>
    /// InternetExplorerDriver driver = new InternetExplorerDriver(options);
    /// </code>
    /// <para></para>
    /// <para>For use with RemoteWebDriver:</para>
    /// <para></para>
    /// <code>
    /// RemoteWebDriver driver = new RemoteWebDriver(new Uri("http://localhost:4444/wd/hub"), options.ToCapabilities());
    /// </code>
    /// </example>
    public class InternetExplorerOptions
    {
        // This capability should be removed when the standalone server is in
        // widespread use.
        private const string UseLegacyInternalServerCapability = "useLegacyInternalServer";
        private const string IgnoreProtectedModeSettingsCapability = "ignoreProtectedModeSettings";

        // This value should be flipped to false to make using the standalone server the default.
        // It should be removed entirely when the standalone server is in widespread use.
        private bool useInternalServer = true;
        private bool ignoreProtectedModeSettings;

        /// <summary>
        /// Gets or sets a value indicating whether to ignore the settings of the Internet Explorer Protected Mode.
        /// </summary>
        public bool IntroduceInstabilityByIgnoringProtectedModeSettings
        {
            get { return this.ignoreProtectedModeSettings; }
            set { this.ignoreProtectedModeSettings = value; }
        }

        /// <summary>
        /// Gets or sets a value indicating whether to use the internal remote InternetExplorerDriverServer class.
        /// </summary>
        /// <remarks>
        /// This property is only transitional. It is designed to allow people to migrate to the downloadable
        /// standalone IE driver server executable. Once that method is in widespread use, this property will
        /// be removed.
        /// </remarks>
        [Obsolete("Using the 'internal server' is temporary, and this property will be removed in a future release")]
        public bool UseInternalServer
        {
            get { return this.useInternalServer; }
            set { this.useInternalServer = value; }
        }

        /// <summary>
        /// Returns DesiredCapabiliites for IE with these options included as
        /// capabilities. This copies the options. Further changes will not be
        /// reflected in the returned capabilities.
        /// </summary>
        /// <returns>The DesiredCapabilities for IE with these options.</returns>
        public ICapabilities ToCapabilities()
        {
            DesiredCapabilities capabilities = DesiredCapabilities.InternetExplorer();
            if (this.ignoreProtectedModeSettings)
            {
                capabilities.SetCapability(IgnoreProtectedModeSettingsCapability, true);
            }

            // This branch should be removed when the standalone server is in
            // widespread use.
            if (this.useInternalServer)
            {
                capabilities.SetCapability(UseLegacyInternalServerCapability, true);
            }

            return capabilities;
        }
    }
}
