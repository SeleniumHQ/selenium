namespace OpenQA.Selenium.Edge
{
    public class StableChannelEdgeDriver : EdgeDriver
    {

        public StableChannelEdgeDriver()
            : base(DefaultOptions)
        {
        }

        // Required for dynamic setting with `EnvironmentManager.Instance.CreateDriverInstance(options)`
        public StableChannelEdgeDriver(EdgeOptions options)
            : base(options)
        {
        }

        public StableChannelEdgeDriver(EdgeDriverService service, EdgeOptions options)
            : base(service, options)
        {
        }
        public static EdgeOptions DefaultOptions
        {
            get { return new EdgeOptions(); }
        }
    }
}
