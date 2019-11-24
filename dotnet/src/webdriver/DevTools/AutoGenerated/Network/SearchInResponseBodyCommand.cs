namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Searches for given string in response content.
    /// </summary>
    public sealed class SearchInResponseBodyCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.searchInResponseBody";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Identifier of the network response to search.
        /// </summary>
        [JsonProperty("requestId")]
        public string RequestId
        {
            get;
            set;
        }
        /// <summary>
        /// String to search for.
        /// </summary>
        [JsonProperty("query")]
        public string Query
        {
            get;
            set;
        }
        /// <summary>
        /// If true, search is case sensitive.
        /// </summary>
        [JsonProperty("caseSensitive", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? CaseSensitive
        {
            get;
            set;
        }
        /// <summary>
        /// If true, treats string parameter as regex.
        /// </summary>
        [JsonProperty("isRegex", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? IsRegex
        {
            get;
            set;
        }
    }

    public sealed class SearchInResponseBodyCommandResponse : ICommandResponse<SearchInResponseBodyCommandSettings>
    {
        /// <summary>
        /// List of search matches.
        ///</summary>
        [JsonProperty("result")]
        public Debugger.SearchMatch[] Result
        {
            get;
            set;
        }
    }
}