using OpenQA.Selenium.BiDi.Communication;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Modules.Session;

internal sealed class SessionModule(Broker broker) : Module(broker)
{
    public async Task<StatusResult> StatusAsync(StatusOptions? options = null)
    {
        return await Broker.ExecuteCommandAsync<StatusResult>(new StatusCommand(), options).ConfigureAwait(false);
    }

    public async Task SubscribeAsync(IEnumerable<string> events, SubscribeOptions? options = null)
    {
        var @params = new SubscribeCommandParameters(events);

        if (options is not null)
        {
            @params.Contexts = options.Contexts;
        }

        await Broker.ExecuteCommandAsync(new SubscribeCommand(@params), options).ConfigureAwait(false);
    }

    public async Task UnsubscribeAsync(IEnumerable<string> events, UnsubscribeOptions? options = null)
    {
        var @params = new SubscribeCommandParameters(events);

        if (options is not null)
        {
            @params.Contexts = options.Contexts;
        }

        await Broker.ExecuteCommandAsync(new UnsubscribeCommand(@params), options).ConfigureAwait(false);
    }

    public async Task<NewResult> NewAsync(CapabilitiesRequest capabilitiesRequest, NewOptions? options = null)
    {
        var @params = new NewCommandParameters(capabilitiesRequest);

        return await Broker.ExecuteCommandAsync<NewResult>(new NewCommand(@params), options).ConfigureAwait(false);
    }

    public async Task EndAsync(EndOptions? options = null)
    {
        await Broker.ExecuteCommandAsync(new EndCommand(), options).ConfigureAwait(false);
    }
}
