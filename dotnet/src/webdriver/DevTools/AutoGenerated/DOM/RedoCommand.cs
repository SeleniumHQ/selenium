namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Re-does the last undone action.
    /// </summary>
    public sealed class RedoCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.redo";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class RedoCommandResponse : ICommandResponse<RedoCommandSettings>
    {
    }
}