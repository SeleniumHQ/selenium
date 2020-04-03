namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Steps into the function call.
    /// </summary>
    public sealed class StepIntoCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.stepInto";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Debugger will issue additional Debugger.paused notification if any async task is scheduled
        /// before next pause.
        /// </summary>
        [JsonProperty("breakOnAsyncCall", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public bool? BreakOnAsyncCall
        {
            get;
            set;
        }
    }

    public sealed class StepIntoCommandResponse : ICommandResponse<StepIntoCommandSettings>
    {
    }
}