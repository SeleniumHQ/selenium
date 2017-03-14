namespace OpenQA.Selenium.Safari
{
    // This is a simple wrapper class to create a SafariDriver that
    // uses the technology preview implementation and has no parameters in the
    // constructor.
    public class SafariTechnologyPreviewDriver : SafariDriver
    {
        public SafariTechnologyPreviewDriver()
            : base("/Applications/Safari Technology Preview.app/Contents/MacOS")
        {
        }
    }
}
