namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Steps out of the function call.
    /// </summary>
    public sealed class StepOutCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.stepOut";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class StepOutCommandResponse : ICommandResponse<StepOutCommandSettings>
    {
    }
}