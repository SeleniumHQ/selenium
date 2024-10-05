#nullable enable

namespace OpenQA.Selenium.BiDi.Modules.Script;

public record RealmDestroyedEventArgs(BiDi BiDi, Realm Realm) : EventArgs(BiDi);
