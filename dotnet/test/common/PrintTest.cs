using NUnit.Framework;
using System;

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

            Assert.That(pdf.AsBase64EncodedString, Does.Contain(MagicString));
        }

        [Test]
        public void CanPrintTwoPages()
        {
            var options = new PrintOptions();

            options.AddPageRangeToPrint("1-2");

            var pdf = printer.Print(options);

            Assert.That(pdf.AsBase64EncodedString, Does.Contain(MagicString));
        }

        [Test]
        public void CanPrintWithMostParams()
        {
            var options = new PrintOptions()
            {
                Orientation = PrintOrientation.Landscape,
                ScaleFactor = 0.5,
                PageDimensions = new PrintOptions.PageSize { Width = 200, Height = 100 },
                PageMargins = new PrintOptions.Margins { Top = 1, Bottom = 1, Left = 2, Right = 2 },
                OutputBackgroundImages = true,
                ShrinkToFit = false
            };

            options.AddPageRangeToPrint("1-3");

            var pdf = printer.Print(options);

            Assert.That(pdf.AsBase64EncodedString, Does.Contain(MagicString));
        }

        [Test]
        public void PageSizeCannotBeNull()
        {
            Assert.That(() => new PrintOptions { PageDimensions = null }, Throws.InstanceOf<ArgumentNullException>());
        }

        [Test]
        public void MarginsCannotBeNull()
        {
            Assert.That(() => new PrintOptions { PageMargins = null }, Throws.InstanceOf<ArgumentNullException>());
        }
    }
}
