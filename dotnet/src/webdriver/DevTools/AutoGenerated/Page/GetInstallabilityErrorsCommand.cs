namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// GetInstallabilityErrors
    /// </summary>
    public sealed class GetInstallabilityErrorsCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.getInstallabilityErrors";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class GetInstallabilityErrorsCommandResponse : ICommandResponse<GetInstallabilityErrorsCommandSettings>
    {
        /// <summary>
        /// Gets or sets the errors
        /// </summary>
        [JsonProperty("errors")]
        public string[] Errors
        {
            get;
            set;
        }
    }
}