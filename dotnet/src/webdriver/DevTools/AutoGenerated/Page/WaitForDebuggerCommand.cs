namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Pauses page execution. Can be resumed using generic Runtime.runIfWaitingForDebugger.
    /// </summary>
    public sealed class WaitForDebuggerCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.waitForDebugger";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class WaitForDebuggerCommandResponse : ICommandResponse<WaitForDebuggerCommandSettings>
    {
    }
}