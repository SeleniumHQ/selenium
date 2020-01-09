namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Sets JavaScript breakpoint at given location specified either by URL or URL regex. Once this
    /// command is issued, all existing parsed scripts will have breakpoints resolved and returned in
    /// `locations` property. Further matching script parsing will result in subsequent
    /// `breakpointResolved` events issued. This logical breakpoint will survive page reloads.
    /// </summary>
    public sealed class SetBreakpointByUrlCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.setBreakpointByUrl";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Line number to set breakpoint at.
        /// </summary>
        [JsonProperty("lineNumber")]
        public long LineNumber
        {
            get;
            set;
        }
        /// <summary>
        /// URL of the resources to set breakpoint on.
        /// </summary>
        [JsonProperty("url", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Url
        {
            get;
            set;
        }
        /// <summary>
        /// Regex pattern for the URLs of the resources to set breakpoints on. Either `url` or
        /// `urlRegex` must be specified.
        /// </summary>
        [JsonProperty("urlRegex", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string UrlRegex
        {
            get;
            set;
        }
        /// <summary>
        /// Script hash of the resources to set breakpoint on.
        /// </summary>
        [JsonProperty("scriptHash", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string ScriptHash
        {
            get;
            set;
        }
        /// <summary>
        /// Offset in the line to set breakpoint at.
        /// </summary>
        [JsonProperty("columnNumber", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public long? ColumnNumber
        {
            get;
            set;
        }
        /// <summary>
        /// Expression to use as a breakpoint condition. When specified, debugger will only stop on the
        /// breakpoint if this expression evaluates to true.
        /// </summary>
        [JsonProperty("condition", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Condition
        {
            get;
            set;
        }
    }

    public sealed class SetBreakpointByUrlCommandResponse : ICommandResponse<SetBreakpointByUrlCommandSettings>
    {
        /// <summary>
        /// Id of the created breakpoint for further reference.
        ///</summary>
        [JsonProperty("breakpointId")]
        public string BreakpointId
        {
            get;
            set;
        }
        /// <summary>
        /// List of the locations this breakpoint resolved into upon addition.
        ///</summary>
        [JsonProperty("locations")]
        public Location[] Locations
        {
            get;
            set;
        }
    }
}