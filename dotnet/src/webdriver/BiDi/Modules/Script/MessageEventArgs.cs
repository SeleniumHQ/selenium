#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Script;

public record MessageEventArgs(BiDi BiDi, Channel Channel, RemoteValue Data, Source Source) : EventArgs(BiDi);
