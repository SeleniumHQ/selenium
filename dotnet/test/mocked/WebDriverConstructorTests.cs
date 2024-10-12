using System.Net;
using FluentAssertions;
using Moq;
using OpenQA.Selenium;
using WireMock.FluentAssertions;
using WireMock.RequestBuilders;
using WireMock.Server;
using Response = WireMock.ResponseBuilders.Response;

namespace WebDriver.Mock.Tests;

public class WebDriverConstructorTests
{
    private WireMockServer mockedServer;
    private string mockedServerUrl;

    [SetUp]
    public void Setup()
    {
        mockedServer = WireMockServer.Start();
        mockedServerUrl = mockedServer.Url!;
    }

    [TearDown]
    public void TearDown()
    {
        mockedServer.Dispose();
    }

    [Test]
    public void ShouldCreateSessionWhenCreated()
    {
        mockedServer.Given(Request.Create().WithPath("/session"))
            .RespondWith(Response.Create()
                .WithHeader("Content-Type", "application/json")
                .WithBodyAsJson(new { }));
        var capabilities = new RemoteSessionSettings();

        _ = new MockWebDriver(mockedServerUrl, capabilities);

        mockedServer.Should().HaveReceivedACall()
            .UsingPost()
            .And.AtUrl($"{mockedServerUrl}/session");
    }

    [Test]
    public void WhenCreateSessionCreatedSetSessionIdAndCapabilities()
    {
        mockedServer.Given(Request.Create().WithPath("/session"))
            .RespondWith(Response.Create()
                .WithHeader("Content-Type", "application/json")
                .WithBodyAsJson(new
                {
                    sessionId = "1-2-3",
                    capabilities = new
                    {
                        browser = "firefox",
                        platform = "linux",
                    }
                }));
        var capabilities = new RemoteSessionSettings();

        var driver = new MockWebDriver(mockedServerUrl, capabilities);

        Assert.Multiple(() =>
        {
            Assert.That(driver.SessionId.ToString(), Is.EqualTo("1-2-3"));
            Assert.That(driver.Capabilities["browser"], Is.EqualTo("firefox"));
            Assert.That(driver.Capabilities["platform"], Is.EqualTo("linux"));
        });
    }

    [Test]
    public void GivenCreateSessionThrowsShouldNotCallQuit()
    {
        mockedServer.Given(Request.Create().UsingPost().WithPath("/session"))
            .RespondWith(Response.Create()
                .WithStatusCode(HttpStatusCode.BadGateway));
        mockedServer.Given(Request.Create().UsingDelete().WithPath("/session/"))
            .RespondWith(Response.Create()
                .WithStatusCode(HttpStatusCode.NotFound)
                .WithHeader("Content-Type", "application/json")
                .WithBody(string.Empty));
        var capabilities = new RemoteSessionSettings();

        Assert.Throws<WebDriverException>(() => { _ = new MockWebDriver(mockedServerUrl, capabilities); });

        mockedServer.Should().HaveReceivedNoCalls()
            .UsingDelete();
    }
}
