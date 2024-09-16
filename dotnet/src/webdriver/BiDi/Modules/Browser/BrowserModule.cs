using System.Collections.Generic;
using System.Threading.Tasks;
using OpenQA.Selenium.BiDi.Communication;

namespace OpenQA.Selenium.BiDi.Modules.Browser;

public sealed class BrowserModule(Broker broker) : Module(broker)
{
    public async Task CloseAsync(CloseOptions? options = null)
    {
        await Broker.ExecuteCommandAsync(new CloseCommand(), options).ConfigureAwait(false);
    }

    public async Task<UserContextInfo> CreateUserContextAsync(CreateUserContextOptions? options = null)
    {
        return await Broker.ExecuteCommandAsync<UserContextInfo>(new CreateUserContextCommand(), options).ConfigureAwait(false);
    }

    public async Task<IReadOnlyList<UserContextInfo>> GetUserContextsAsync(GetUserContextsOptions? options = null)
    {
        var result = await Broker.ExecuteCommandAsync<GetUserContextsResult>(new GetUserContextsCommand(), options).ConfigureAwait(false);

        return result.UserContexts;
    }

    public async Task RemoveUserContextAsync(UserContext userContext, RemoveUserContextOptions? options = null)
    {
        var @params = new RemoveUserContextCommandParameters(userContext);

        await Broker.ExecuteCommandAsync(new RemoveUserContextCommand(@params), options).ConfigureAwait(false);
    }
}
