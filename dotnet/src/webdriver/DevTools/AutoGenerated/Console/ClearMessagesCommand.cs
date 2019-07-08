namespace OpenQA.Selenium.DevTools.Console
{
    using Newtonsoft.Json;

    /// <summary>
    /// Does nothing.
    /// </summary>
    public sealed class ClearMessagesCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Console.clearMessages";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class ClearMessagesCommandResponse : ICommandResponse<ClearMessagesCommandSettings>
    {
    }
}