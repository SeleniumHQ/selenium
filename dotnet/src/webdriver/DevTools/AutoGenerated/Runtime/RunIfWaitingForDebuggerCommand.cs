namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// Tells inspected instance to run if it was waiting for debugger to attach.
    /// </summary>
    public sealed class RunIfWaitingForDebuggerCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Runtime.runIfWaitingForDebugger";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class RunIfWaitingForDebuggerCommandResponse : ICommandResponse<RunIfWaitingForDebuggerCommandSettings>
    {
    }
}