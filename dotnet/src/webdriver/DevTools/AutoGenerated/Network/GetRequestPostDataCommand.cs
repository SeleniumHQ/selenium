namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns post data sent with the request. Returns an error when no data was sent with the request.
    /// </summary>
    public sealed class GetRequestPostDataCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.getRequestPostData";
        
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

    public sealed class GetRequestPostDataCommandResponse : ICommandResponse<GetRequestPostDataCommandSettings>
    {
        /// <summary>
        /// Request body string, omitting files from multipart requests
        ///</summary>
        [JsonProperty("postData")]
        public string PostData
        {
            get;
            set;
        }
    }
}