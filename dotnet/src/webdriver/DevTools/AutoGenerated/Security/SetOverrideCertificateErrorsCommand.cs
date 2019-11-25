namespace OpenQA.Selenium.DevTools.Security
{
    using Newtonsoft.Json;

    /// <summary>
    /// Enable/disable overriding certificate errors. If enabled, all certificate error events need to
    /// be handled by the DevTools client and should be answered with `handleCertificateError` commands.
    /// </summary>
    public sealed class SetOverrideCertificateErrorsCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Security.setOverrideCertificateErrors";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// If true, certificate errors will be overridden.
        /// </summary>
        [JsonProperty("override")]
        public bool Override
        {
            get;
            set;
        }
    }

    public sealed class SetOverrideCertificateErrorsCommandResponse : ICommandResponse<SetOverrideCertificateErrorsCommandSettings>
    {
    }
}