namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Resets navigation history for the current page.
    /// </summary>
    public sealed class ResetNavigationHistoryCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.resetNavigationHistory";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class ResetNavigationHistoryCommandResponse : ICommandResponse<ResetNavigationHistoryCommandSettings>
    {
    }
}