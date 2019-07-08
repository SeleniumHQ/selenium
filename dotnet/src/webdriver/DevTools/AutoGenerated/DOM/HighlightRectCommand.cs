namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Highlights given rectangle.
    /// </summary>
    public sealed class HighlightRectCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.highlightRect";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class HighlightRectCommandResponse : ICommandResponse<HighlightRectCommandSettings>
    {
    }
}