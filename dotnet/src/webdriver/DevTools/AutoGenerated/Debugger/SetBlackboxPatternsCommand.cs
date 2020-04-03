namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Replace previous blackbox patterns with passed ones. Forces backend to skip stepping/pausing in
    /// scripts with url matching one of the patterns. VM will try to leave blackboxed script by
    /// performing 'step in' several times, finally resorting to 'step out' if unsuccessful.
    /// </summary>
    public sealed class SetBlackboxPatternsCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.setBlackboxPatterns";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Array of regexps that will be used to check script url for blackbox state.
        /// </summary>
        [JsonProperty("patterns")]
        public string[] Patterns
        {
            get;
            set;
        }
    }

    public sealed class SetBlackboxPatternsCommandResponse : ICommandResponse<SetBlackboxPatternsCommandSettings>
    {
    }
}