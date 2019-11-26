namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Tries to close page, running its beforeunload hooks, if any.
    /// </summary>
    public sealed class CloseCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.close";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class CloseCommandResponse : ICommandResponse<CloseCommandSettings>
    {
    }
}