namespace OpenQA.Selenium.Environment
{
    public class DriverStartingEventArgs
    {
        DriverService service;
        DriverOptions options;

        public DriverStartingEventArgs(DriverOptions options)
        {
            this.Options = options;
        }

        public DriverService Service { get => service; set => service = value; }

        public DriverOptions Options { get => options; set => options = value; }
    }
}
