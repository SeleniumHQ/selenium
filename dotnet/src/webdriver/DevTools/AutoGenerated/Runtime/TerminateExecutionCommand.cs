namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// Terminate current or next JavaScript execution.
    /// Will cancel the termination when the outer-most script execution ends.
    /// </summary>
    public sealed class TerminateExecutionCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Runtime.terminateExecution";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class TerminateExecutionCommandResponse : ICommandResponse<TerminateExecutionCommandSettings>
    {
    }
}