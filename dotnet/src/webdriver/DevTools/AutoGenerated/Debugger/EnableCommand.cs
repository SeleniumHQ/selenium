namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Enables debugger for the given page. Clients should not assume that the debugging has been
    /// enabled until the result for this command is received.
    /// </summary>
    public sealed class EnableCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.enable";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// The maximum size in bytes of collected scripts (not referenced by other heap objects)
        /// the debugger can hold. Puts no limit if paramter is omitted.
        /// </summary>
        [JsonProperty("maxScriptsCacheSize", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public double? MaxScriptsCacheSize
        {
            get;
            set;
        }
    }

    public sealed class EnableCommandResponse : ICommandResponse<EnableCommandSettings>
    {
        /// <summary>
        /// Unique identifier of the debugger.
        ///</summary>
        [JsonProperty("debuggerId")]
        public string DebuggerId
        {
            get;
            set;
        }
    }
}