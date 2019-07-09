namespace OpenQA.Selenium.DevTools.Schema
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns supported domains.
    /// </summary>
    public sealed class GetDomainsCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Schema.getDomains";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class GetDomainsCommandResponse : ICommandResponse<GetDomainsCommandSettings>
    {
        /// <summary>
        /// List of supported domains.
        ///</summary>
        [JsonProperty("domains")]
        public Domain[] Domains
        {
            get;
            set;
        }
    }
}