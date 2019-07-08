namespace OpenQA.Selenium.DevTools.Security
{
    using Newtonsoft.Json;

    /// <summary>
    /// Enable/disable whether all certificate errors should be ignored.
    /// </summary>
    public sealed class SetIgnoreCertificateErrorsCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Security.setIgnoreCertificateErrors";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// If true, all certificate errors will be ignored.
        /// </summary>
        [JsonProperty("ignore")]
        public bool Ignore
        {
            get;
            set;
        }
    }

    public sealed class SetIgnoreCertificateErrorsCommandResponse : ICommandResponse<SetIgnoreCertificateErrorsCommandSettings>
    {
    }
}