namespace OpenQA.Selenium.DevTools.Log
{
    using Newtonsoft.Json;

    /// <summary>
    /// Enables log domain, sends the entries collected so far to the client by means of the
    /// `entryAdded` notification.
    /// </summary>
    public sealed class EnableCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Log.enable";
        
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