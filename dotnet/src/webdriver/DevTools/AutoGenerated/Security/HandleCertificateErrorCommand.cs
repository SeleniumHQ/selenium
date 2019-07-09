namespace OpenQA.Selenium.DevTools.Security
{
    using Newtonsoft.Json;

    /// <summary>
    /// Handles a certificate error that fired a certificateError event.
    /// </summary>
    public sealed class HandleCertificateErrorCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Security.handleCertificateError";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// The ID of the event.
        /// </summary>
        [JsonProperty("eventId")]
        public long EventId
        {
            get;
            set;
        }
        /// <summary>
        /// The action to take on the certificate error.
        /// </summary>
        [JsonProperty("action")]
        public CertificateErrorAction Action
        {
            get;
            set;
        }
    }

    public sealed class HandleCertificateErrorCommandResponse : ICommandResponse<HandleCertificateErrorCommandSettings>
    {
    }
}