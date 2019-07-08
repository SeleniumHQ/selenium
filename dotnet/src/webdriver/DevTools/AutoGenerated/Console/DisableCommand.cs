namespace OpenQA.Selenium.DevTools.Console
{
    using Newtonsoft.Json;

    /// <summary>
    /// Disables console domain, prevents further console messages from being reported to the client.
    /// </summary>
    public sealed class DisableCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Console.disable";
        
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