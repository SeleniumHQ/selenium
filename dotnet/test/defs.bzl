def tests_nuget_package(nuget_package):
    return "@paket.tests_nuget//%s" % (nuget_package.lower())
