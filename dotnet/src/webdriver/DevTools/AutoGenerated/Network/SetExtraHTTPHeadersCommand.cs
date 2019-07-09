namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Specifies whether to always send extra HTTP headers with the requests from this page.
    /// </summary>
    public sealed class SetExtraHTTPHeadersCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.setExtraHTTPHeaders";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Map with extra HTTP headers.
        /// </summary>
        [JsonProperty("headers")]
        public Headers Headers
        {
            get;
            set;
        }
    }

    public sealed class SetExtraHTTPHeadersCommandResponse : ICommandResponse<SetExtraHTTPHeadersCommandSettings>
    {
    }
}