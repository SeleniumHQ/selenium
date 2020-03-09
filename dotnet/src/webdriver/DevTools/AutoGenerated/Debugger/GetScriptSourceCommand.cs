namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Returns source for the script with given id.
    /// </summary>
    public sealed class GetScriptSourceCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.getScriptSource";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Id of the script to get source for.
        /// </summary>
        [JsonProperty("scriptId")]
        public string ScriptId
        {
            get;
            set;
        }
    }

    public sealed class GetScriptSourceCommandResponse : ICommandResponse<GetScriptSourceCommandSettings>
    {
        /// <summary>
        /// Script source.
        ///</summary>
        [JsonProperty("scriptSource")]
        public string ScriptSource
        {
            get;
            set;
        }
    }
}