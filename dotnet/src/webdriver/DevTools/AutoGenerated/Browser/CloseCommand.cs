namespace OpenQA.Selenium.DevTools.Browser
{
    using Newtonsoft.Json;

    /// <summary>
    /// Close browser gracefully.
    /// </summary>
    public sealed class CloseCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Browser.close";
        
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