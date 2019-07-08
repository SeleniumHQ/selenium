namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Sets JavaScript breakpoint before each call to the given function.
    /// If another function was created from the same source as a given one,
    /// calling it will also trigger the breakpoint.
    /// </summary>
    public sealed class SetBreakpointOnFunctionCallCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.setBreakpointOnFunctionCall";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Function object id.
        /// </summary>
        [JsonProperty("objectId")]
        public string ObjectId
        {
            get;
            set;
        }
        /// <summary>
        /// Expression to use as a breakpoint condition. When specified, debugger will
        /// stop on the breakpoint if this expression evaluates to true.
        /// </summary>
        [JsonProperty("condition", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Condition
        {
            get;
            set;
        }
    }

    public sealed class SetBreakpointOnFunctionCallCommandResponse : ICommandResponse<SetBreakpointOnFunctionCallCommandSettings>
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
    }
}