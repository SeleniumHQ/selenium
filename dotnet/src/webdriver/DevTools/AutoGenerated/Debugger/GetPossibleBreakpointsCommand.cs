namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns possible locations for breakpoint. scriptId in start and end range locations should be
    /// the same.
    /// </summary>
    public sealed class GetPossibleBreakpointsCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.getPossibleBreakpoints";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Start of range to search possible breakpoint locations in.
        /// </summary>
        [JsonProperty("start")]
        public Location Start
        {
            get;
            set;
        }
        /// <summary>
        /// End of range to search possible breakpoint locations in (excluding). When not specified, end
        /// of scripts is used as end of range.
        /// </summary>
        [JsonProperty("end", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Location End
        {
            get;
            set;
        }
        /// <summary>
        /// Only consider locations which are in the same (non-nested) function as start.
        /// </summary>
        [JsonProperty("restrictToFunction", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? RestrictToFunction
        {
            get;
            set;
        }
    }

    public sealed class GetPossibleBreakpointsCommandResponse : ICommandResponse<GetPossibleBreakpointsCommandSettings>
    {
        /// <summary>
        /// List of the possible breakpoint locations.
        ///</summary>
        [JsonProperty("locations")]
        public BreakLocation[] Locations
        {
            get;
            set;
        }
    }
}