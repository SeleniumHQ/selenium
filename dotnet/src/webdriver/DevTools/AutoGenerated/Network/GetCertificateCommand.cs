namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns the DER-encoded certificate.
    /// </summary>
    public sealed class GetCertificateCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.getCertificate";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Origin to get certificate for.
        /// </summary>
        [JsonProperty("origin")]
        public string Origin
        {
            get;
            set;
        }
    }

    public sealed class GetCertificateCommandResponse : ICommandResponse<GetCertificateCommandSettings>
    {
        /// <summary>
        /// Gets or sets the tableNames
        /// </summary>
        [JsonProperty("tableNames")]
        public string[] TableNames
        {
            get;
            set;
        }
    }
}