namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns content served for the given request.
    /// </summary>
    public sealed class GetResponseBodyCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.getResponseBody";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Identifier of the network request to get content for.
        /// </summary>
        [JsonProperty("requestId")]
        public string RequestId
        {
            get;
            set;
        }
    }

    public sealed class GetResponseBodyCommandResponse : ICommandResponse<GetResponseBodyCommandSettings>
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