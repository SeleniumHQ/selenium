namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns content served for the given currently intercepted request.
    /// </summary>
    public sealed class GetResponseBodyForInterceptionCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.getResponseBodyForInterception";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Identifier for the intercepted request to get body for.
        /// </summary>
        [JsonProperty("interceptionId")]
        public string InterceptionId
        {
            get;
            set;
        }
    }

    public sealed class GetResponseBodyForInterceptionCommandResponse : ICommandResponse<GetResponseBodyForInterceptionCommandSettings>
    {
        /// <summary>
        /// Response body.
        ///</summary>
        [JsonProperty("body")]
        public string Body
        {
            get;
            set;
        }
        /// <summary>
        /// True, if content was sent as base64.
        ///</summary>
        [JsonProperty("base64Encoded")]
        public bool Base64Encoded
        {
            get;
            set;
        }
    }
}