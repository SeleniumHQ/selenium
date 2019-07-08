namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Force the page stop all navigations and pending resource fetches.
    /// </summary>
    public sealed class StopLoadingCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.stopLoading";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class StopLoadingCommandResponse : ICommandResponse<StopLoadingCommandSettings>
    {
    }
}