using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class PrintTest : DriverTestFixture
    {
        private const string MagicString = "JVBER";
        private ISupportsPrint printer;

        [SetUp]
        public void LocalSetUp()
        {
            Assert.That(driver, Is.InstanceOf<ISupportsPrint>(), $"Driver does not support {nameof(ISupportsPrint)}.");

            printer = driver as ISupportsPrint;

            driver.Navigate().GoToUrl(this.printPage);
        }

        [Test]
        public void CanPrintPage()
        {
            var pdf = printer.Print(new PrintOptions());

            Assert.That(pdf.AsBase64EncodedString, Does.Contain(MagicString), "Printed PDF does not contain the expected magic string.");
        }

        //[Test]
        //[Ignore("Skipped for Chrome because it needs to run headless, a workaround is needed.")]
        //public void CanPrintTwoPages()
        //{
        //    PrintOptions printOptions = new PrintOptions
        //    {
        //        PageRanges = "1-2"
        //    };

        //    var pdf = printer.Print(printOptions);
        //    Assert.That(pdf.Content.Contains(MAGIC_STRING), Is.True, "Printed PDF does not contain the expected magic string.");
        //}

        //[Test]
        //[Ignore("Skipped for Chrome because it needs to run headless, a workaround is needed.")]
        //public void CanPrintWithValidParams()
        //{
        //    PrintOptions printOptions = new PrintOptions();

        //    //set all options
        //    printOptions.PageRanges = "1";
        //    printOptions.Orientation = PrintOrientation.Landscape;
        //    printOptions.PageSize = new PageSize();
        //    printOptions.Scale = 0.5;
        //    printOptions.DisplayHeaderFooter = true;
        //    printOptions.HeaderTemplate = "Header";
        //    printOptions.FooterTemplate = "Footer";
        //    printOptions.PrintBackground = true;
        //    printOptions.shrinkToFit = true;

        //    var pdf = printer.Print(printOptions);
        //    Assert.That(pdf.Content.Contains(MAGIC_STRING), Is.True, "Printed PDF does not contain the expected magic string.");
        //}
    }
}
