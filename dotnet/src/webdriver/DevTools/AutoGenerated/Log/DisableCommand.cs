namespace OpenQA.Selenium.DevTools.Log
{
    using Newtonsoft.Json;

    /// <summary>
    /// Disables log domain, prevents further log entries from being reported to the client.
    /// </summary>
    public sealed class DisableCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Log.disable";
        
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