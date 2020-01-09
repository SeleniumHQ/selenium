namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Undoes the last performed action.
    /// </summary>
    public sealed class UndoCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.undo";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class UndoCommandResponse : ICommandResponse<UndoCommandSettings>
    {
    }
}