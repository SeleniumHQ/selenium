namespace OpenQA.Selenium.DevTools.Page
{
    using Newtonsoft.Json;

    /// <summary>
    /// Brings page to front (activates tab).
    /// </summary>
    public sealed class BringToFrontCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Page.bringToFront";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class BringToFrontCommandResponse : ICommandResponse<BringToFrontCommandSettings>
    {
    }
}