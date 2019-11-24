namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Disables network tracking, prevents network events from being sent to the client.
    /// </summary>
    public sealed class DisableCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.disable";
        
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