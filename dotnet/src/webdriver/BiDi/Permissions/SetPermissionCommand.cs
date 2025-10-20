using OpenQA.Selenium.BiDi.Browser;
using OpenQA.Selenium.BiDi.Communication;

namespace OpenQA.Selenium.BiDi.Permissions;

internal class SetPermissionCommand(SetPermissionCommandParameters @params)
    : Command<SetPermissionCommandParameters, SetPermissionResult>(@params, "permissions.setPermission");

public class SetPermissionOptions : CommandOptions;
public sealed record SetPermissionResult : EmptyResult;

internal record SetPermissionCommandParameters(PermissionDescriptor Descriptor, PermissionState State, string Origin, UserContext? UserContext) : Parameters;
