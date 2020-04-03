namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Enables page domain notifications.
    /// </summary>
    public sealed class EnableCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.enable";
        
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