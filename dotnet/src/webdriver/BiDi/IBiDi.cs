
using OpenQA.Selenium.BiDi.Browser;
using OpenQA.Selenium.BiDi.BrowsingContext;
using OpenQA.Selenium.BiDi.Emulation;
using OpenQA.Selenium.BiDi.Input;
using OpenQA.Selenium.BiDi.Log;
using OpenQA.Selenium.BiDi.Network;
using OpenQA.Selenium.BiDi.Script;
using OpenQA.Selenium.BiDi.Session;
using OpenQA.Selenium.BiDi.Storage;
using OpenQA.Selenium.BiDi.WebExtension;

namespace OpenQA.Selenium.BiDi;

public interface IBiDi : IAsyncDisposable
{
    IBrowserModule Browser { get; }

    IBrowsingContextModule BrowsingContext { get; }

    IEmulationModule Emulation { get; }

    IInputModule Input { get; }

    ILogModule Log { get; }

    INetworkModule Network { get; }

    IScriptModule Script { get; }

    IStorageModule Storage { get; }

    IWebExtensionModule WebExtension { get; }

    Task<StatusResult> StatusAsync(StatusOptions? options = null, CancellationToken cancellationToken = default);

    Task<NewResult> NewAsync(CapabilitiesRequest capabilities, NewOptions? options = null, CancellationToken cancellationToken = default);

    Task EndAsync(EndOptions? options = null, CancellationToken cancellationToken = default);

    T AsModule<T>() where T : Module, new();
}
