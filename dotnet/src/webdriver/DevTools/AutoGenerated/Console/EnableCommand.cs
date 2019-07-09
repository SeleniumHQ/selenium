namespace OpenQA.Selenium.DevTools.Console
{
    using Newtonsoft.Json;

    /// <summary>
    /// Enables console domain, sends the messages collected so far to the client by means of the
    /// `messageAdded` notification.
    /// </summary>
    public sealed class EnableCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Console.enable";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class EnableCommandResponse : ICommandResponse<EnableCommandSettings>
    {
    }
}