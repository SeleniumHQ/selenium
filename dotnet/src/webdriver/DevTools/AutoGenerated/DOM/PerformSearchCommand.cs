namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Searches for a given string in the DOM tree. Use `getSearchResults` to access search results or
    /// `cancelSearch` to end this search session.
    /// </summary>
    public sealed class PerformSearchCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.performSearch";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Plain text or query selector or XPath search query.
        /// </summary>
        [JsonProperty("query")]
        public string Query
        {
            get;
            set;
        }
        /// <summary>
        /// True to search in user agent shadow DOM.
        /// </summary>
        [JsonProperty("includeUserAgentShadowDOM", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? IncludeUserAgentShadowDOM
        {
            get;
            set;
        }
    }

    public sealed class PerformSearchCommandResponse : ICommandResponse<PerformSearchCommandSettings>
    {
        /// <summary>
        /// Unique search session identifier.
        ///</summary>
        [JsonProperty("searchId")]
        public string SearchId
        {
            get;
            set;
        }
        /// <summary>
        /// Number of search results.
        ///</summary>
        [JsonProperty("resultCount")]
        public long ResultCount
        {
            get;
            set;
        }
    }
}