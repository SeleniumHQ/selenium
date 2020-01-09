namespace OpenQA.Selenium.DevTools.DOM
{
    using Newtonsoft.Json;

    /// <summary>
    /// Marks last undoable state.
    /// </summary>
    public sealed class MarkUndoableStateCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "DOM.markUndoableState";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class MarkUndoableStateCommandResponse : ICommandResponse<MarkUndoableStateCommandSettings>
    {
    }
}