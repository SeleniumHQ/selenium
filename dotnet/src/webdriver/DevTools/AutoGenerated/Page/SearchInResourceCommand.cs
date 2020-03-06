namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Searches for given string in resource content.
    /// </summary>
    public sealed class SearchInResourceCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.searchInResource";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Frame id for resource to search in.
        /// </summary>
        [JsonProperty("frameId")]
        public string FrameId
        {
            get;
            set;
        }
        /// <summary>
        /// URL of the resource to search in.
        /// </summary>
        [JsonProperty("url")]
        public string Url
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

    public sealed class SearchInResourceCommandResponse : ICommandResponse<SearchInResourceCommandSettings>
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