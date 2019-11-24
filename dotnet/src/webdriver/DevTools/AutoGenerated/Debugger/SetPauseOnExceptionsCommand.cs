namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Defines pause on exceptions state. Can be set to stop on all exceptions, uncaught exceptions or
    /// no exceptions. Initial pause on exceptions state is `none`.
    /// </summary>
    public sealed class SetPauseOnExceptionsCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.setPauseOnExceptions";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

        /// <summary>
        /// Pause on exceptions mode.
        /// </summary>
        [JsonProperty("state")]
        public string State
        {
            get;
            set;
        }
    }

    public sealed class SetPauseOnExceptionsCommandResponse : ICommandResponse<SetPauseOnExceptionsCommandSettings>
    {
    }
}