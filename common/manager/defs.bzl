# What a test that exercises Selenium Manager needs: network on RBE, scoped to the test action by
# the `test.` prefix, and under --manager=stub the binary built from source in place of the stub.
SE_MANAGER_TEST_EXEC_PROPERTIES = {"test.dockerNetwork": "standard"}

SE_MANAGER_TEST_DATA = select({
    "//common:manager_stub": ["//rust:selenium-manager"],
    "//conditions:default": [],
})

SE_MANAGER_TEST_ENV = select({
    "//common:manager_stub": {"SE_MANAGER_PATH": "$(rlocationpath //rust:selenium-manager)"},
    "//conditions:default": {},
})
