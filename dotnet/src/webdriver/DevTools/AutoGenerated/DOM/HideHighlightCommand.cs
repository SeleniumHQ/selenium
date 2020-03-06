namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Hides any highlight.
    /// </summary>
    public sealed class HideHighlightCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.hideHighlight";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class HideHighlightCommandResponse : ICommandResponse<HideHighlightCommandSettings>
    {
    }
}