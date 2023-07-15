namespace OpenQA.Selenium.Chrome
{
    public class DevChannelChromeDriver : ChromeDriver
    {
        public DevChannelChromeDriver()
            : base(DefaultOptions)
        {
        }

        // Required for dynamic setting with `EnvironmentManager.Instance.CreateDriverInstance(options)`
        public DevChannelChromeDriver(ChromeOptions options)
            : base(options)
        {
        }

        public static ChromeOptions DefaultOptions
        {
            get { return new ChromeOptions() { BrowserVersion = "dev" }; }
        }
    }
}
