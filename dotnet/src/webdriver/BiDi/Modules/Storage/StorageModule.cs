using OpenQA.Selenium.BiDi.Communication;
using System.Threading.Tasks;

namespace OpenQA.Selenium.BiDi.Modules.Storage;

public class StorageModule(Broker broker) : Module(broker)
{
    public async Task<GetCookiesResult> GetCookiesAsync(GetCookiesOptions? options = null)
    {
        var @params = new GetCookiesCommandParameters();

        if (options is not null)
        {
            @params.Filter = options.Filter;
            @params.Partition = options.Partition;
        }

        return await Broker.ExecuteCommandAsync<GetCookiesResult>(new GetCookiesCommand(@params), options).ConfigureAwait(false);
    }

    public async Task<DeleteCookiesResult> DeleteCookiesAsync(DeleteCookiesOptions? options = null)
    {
        var @params = new DeleteCookiesCommandParameters();

        if (options is not null)
        {
            @params.Filter = options.Filter;
            @params.Partition = options.Partition;
        }

        return await Broker.ExecuteCommandAsync<DeleteCookiesResult>(new DeleteCookiesCommand(@params), options).ConfigureAwait(false);
    }

    public async Task<SetCookieResult> SetCookieAsync(PartialCookie cookie, SetCookieOptions? options = null)
    {
        var @params = new SetCookieCommandParameters(cookie);

        if (options is not null)
        {
            @params.Partition = options.Partition;
        }

        return await Broker.ExecuteCommandAsync<SetCookieResult>(new SetCookieCommand(@params), options).ConfigureAwait(false);
    }
}
