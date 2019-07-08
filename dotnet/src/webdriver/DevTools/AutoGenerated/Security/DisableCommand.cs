namespace OpenQA.Selenium.DevTools.Security
{
    using Newtonsoft.Json;

    /// <summary>
    /// Disables tracking security state changes.
    /// </summary>
    public sealed class DisableCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Security.disable";
        
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