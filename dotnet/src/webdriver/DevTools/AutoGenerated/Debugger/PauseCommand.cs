namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// Stops on the next JavaScript statement.
    /// </summary>
    public sealed class PauseCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Debugger.pause";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class PauseCommandResponse : ICommandResponse<PauseCommandSettings>
    {
    }
}