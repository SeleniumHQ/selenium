namespace OpenQA.Selenium.DevTools.Performance
{
    using Newtonsoft.Json;

    /// <summary>
    /// Disable collecting and reporting metrics.
    /// </summary>
    public sealed class DisableCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Performance.disable";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class DisableCommandResponse : ICommandResponse<DisableCommandSettings>
    {
    }
}