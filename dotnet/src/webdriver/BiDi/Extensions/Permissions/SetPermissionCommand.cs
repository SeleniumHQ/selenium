using OpenQA.Selenium.BiDi.Browser;
using OpenQA.Selenium.BiDi.Communication;
using OpenQA.Selenium.BiDi.Communication.Json.Converters;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Extensions.Permissions;

internal class SetPermissionCommand(SetPermissionCommandParameters @params)
    : Command<SetPermissionCommandParameters, SetPermissionResult>(@params, "permissions.setPermission");

public class SetPermissionOptions : CommandOptions;
public sealed record SetPermissionResult : EmptyResult;

internal record SetPermissionCommandParameters(PermissionDescriptor Descriptor, PermissionState State, string Origin, UserContext? UserContext) : Parameters;
