namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Steps over the statement.
    /// </summary>
    public sealed class StepOverCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.stepOver";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class StepOverCommandResponse : ICommandResponse<StepOverCommandSettings>
    {
    }
}