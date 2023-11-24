namespace OpenQA.Selenium.Edge
{
    public class DevChannelEdgeDriver : EdgeDriver
    {
        public DevChannelEdgeDriver()
            : base(DefaultOptions)
        {
        }

        // Required for dynamic setting with `EnvironmentManager.Instance.CreateDriverInstance(options)`
        public DevChannelEdgeDriver(EdgeOptions options)
            : base(options)
        {
        }

        public DevChannelEdgeDriver(EdgeDriverService service, EdgeOptions options)
            : base(service, options)
        {
        }

        public static EdgeOptions DefaultOptions
        {
            get { return new EdgeOptions() { BrowserVersion = "dev" }; }
        }
    }
}
