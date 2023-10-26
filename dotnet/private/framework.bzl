def framework(framework_moniker, name):
    return "@paket.%s//%s" % (framework_moniker, name.lower())
