using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.PrintOptions;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Print
using System;

[TestFixture]
public class PrintPageTest
{
    private const string MAGIC_STRING = "JVBER";
    private IPrintsPage printer;
    private IWebDriver driver;

    [SetUp]
    public void SetUp()
    {
        driver = new ChromeDriver();
        Assert.IsInstanceOf<IPrintsPage>(driver, "Driver does not implement PrintsPage.");
        printer = (IPrintsPage)driver;
        driver.Navigate().GoToUrl("http://selenium.dev");
    }

    [Test]
    [Ignore("Skipped for Chrome because it needs to run headless, a workaround is needed.")]
    public void CanPrintPage()
    {
        PrintOptions printOptions = new PrintOptions();
        var pdf = printer.Print(printOptions);
        Assert.That(pdf.Content.Contains(MAGIC_STRING), Is.True, "Printed PDF does not contain the expected magic string.");
    }

    [Test]
    [Ignore("Skipped for Chrome because it needs to run headless, a workaround is needed.")]
    public void CanPrintTwoPages()
    {
        PrintOptions printOptions = new PrintOptions
        {
            PageRanges = "1-2"
        };

        var pdf = printer.Print(printOptions);
        Assert.That(pdf.Content.Contains(MAGIC_STRING), Is.True, "Printed PDF does not contain the expected magic string.");
    }

    [Test]
    [Ignore("Skipped for Chrome because it needs to run headless, a workaround is needed.")]
    public void CanPrintWithValidParams()
    {
        PrintOptions printOptions = new PrintOptions();

        //set all options
        printOptions.PageRanges = "1";
        printOptions.Orientation = PrintOrientation.Landscape;
        printOptions.PageSize = new PageSize();
        printOptions.Scale = 0.5;
        printOptions.DisplayHeaderFooter = true;
        printOptions.HeaderTemplate = "Header";
        printOptions.FooterTemplate = "Footer";
        printOptions.PrintBackground = true;
        printOptions.shrinkToFit = true;

        var pdf = printer.Print(printOptions);
        Assert.That(pdf.Content.Contains(MAGIC_STRING), Is.True, "Printed PDF does not contain the expected magic string.");
    }
}
