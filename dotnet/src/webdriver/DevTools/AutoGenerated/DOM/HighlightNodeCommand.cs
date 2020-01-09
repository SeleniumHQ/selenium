namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Highlights DOM node.
    /// </summary>
    public sealed class HighlightNodeCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.highlightNode";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class HighlightNodeCommandResponse : ICommandResponse<HighlightNodeCommandSettings>
    {
    }
}