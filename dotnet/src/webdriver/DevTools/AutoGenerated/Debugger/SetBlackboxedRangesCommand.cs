namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Makes backend skip steps in the script in blackboxed ranges. VM will try leave blacklisted
    /// scripts by performing 'step in' several times, finally resorting to 'step out' if unsuccessful.
    /// Positions array contains positions where blackbox state is changed. First interval isn't
    /// blackboxed. Array should be sorted.
    /// </summary>
    public sealed class SetBlackboxedRangesCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.setBlackboxedRanges";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Id of the script.
        /// </summary>
        [JsonProperty("scriptId")]
        public string ScriptId
        {
            get;
            set;
        }
        /// <summary>
        /// Gets or sets the positions
        /// </summary>
        [JsonProperty("positions")]
        public ScriptPosition[] Positions
        {
            get;
            set;
        }
    }

    public sealed class SetBlackboxedRangesCommandResponse : ICommandResponse<SetBlackboxedRangesCommandSettings>
    {
    }
}