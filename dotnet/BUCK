load("//dotnet:selenium-dotnet-version.bzl", "SE_VERSION")

export_file(
    name = "keyfile",
    src = "WebDriver.snk",
    out = "WebDriver.snk",
    visibility = ["PUBLIC"],
)

zip_file(
    name = "release",
    srcs = [
        "//dotnet/src/webdriver:pack",
        "//dotnet/src/webdriverbackedselenium:pack",
        "//dotnet/src/support:pack",
    ],
    out = "selenium-dotnet-{}.zip".format(SE_VERSION),
)

zip_file(
    name = "release_strongnamed",
    srcs = [
        "//dotnet/src/webdriver:pack_strongnamed",
        "//dotnet/src/webdriverbackedselenium:pack_strongnamed",
        "//dotnet/src/support:pack_strongnamed",
    ],
    out = "selenium-dotnet-strongnamed-{}.zip".format(SE_VERSION),
)
