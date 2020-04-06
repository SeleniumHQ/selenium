namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Clears browser cookies.
    /// </summary>
    public sealed class ClearBrowserCookiesCommandSettings : ICommand
    {
        private const string DevToolsRemoteInterface_CommandName = "Network.clearBrowserCookies";
        
        [JsonIgnore]
        public string CommandName
        {
            get { return DevToolsRemoteInterface_CommandName; }
        }

    }

    public sealed class ClearBrowserCookiesCommandResponse : ICommandResponse<ClearBrowserCookiesCommandSettings>
    {
    }
}