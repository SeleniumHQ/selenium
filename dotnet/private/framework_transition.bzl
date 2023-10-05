load("@bazel_skylib//lib:dicts.bzl", "dicts")
load(
    "@rules_dotnet//dotnet/private:common.bzl",
    "FRAMEWORK_COMPATIBILITY",
    "is_core_framework",
)
load("@rules_dotnet//dotnet/private:rids.bzl", "RUNTIME_GRAPH")
load(
    "@rules_dotnet//dotnet/private/transitions:common.bzl",
    "FRAMEWORK_COMPATABILITY_TRANSITION_OUTPUTS",
    "RID_COMPATABILITY_TRANSITION_OUTPUTS",
)

DEFAULT_TOOL_FRAMEWORK = "net6.0"

def _target_framework_transition_impl(settings, attr):
    target_framework = getattr(attr, "target_framework", DEFAULT_TOOL_FRAMEWORK)

    if not is_core_framework(target_framework):
        msg = "Transitions must be to a .Net Core framework: " + target_framework
        fail(msg)

    incoming_tfm = settings["@rules_dotnet//dotnet:target_framework"]

    if incoming_tfm not in FRAMEWORK_COMPATABILITY_TRANSITION_OUTPUTS:
        fail("Error setting @rules_dotnet//dotnet:target_framework: invalid value '" + incoming_tfm + "'. Allowed values are " + str(FRAMEWORK_COMPATIBILITY.keys()))

    transitioned_tfm = target_framework

    runtime_identifier = settings["@rules_dotnet//dotnet:rid"]

    return dicts.add({"@rules_dotnet//dotnet:target_framework": transitioned_tfm}, {"@rules_dotnet//dotnet:rid": runtime_identifier}, FRAMEWORK_COMPATABILITY_TRANSITION_OUTPUTS[transitioned_tfm], RID_COMPATABILITY_TRANSITION_OUTPUTS[runtime_identifier])

target_framework_transition = transition(
    implementation = _target_framework_transition_impl,
    inputs = ["@rules_dotnet//dotnet:target_framework", "@rules_dotnet//dotnet:rid", "//command_line_option:cpu", "//command_line_option:platforms"],
    outputs = ["@rules_dotnet//dotnet:target_framework", "@rules_dotnet//dotnet:rid"] +
              ["@rules_dotnet//dotnet:framework_compatible_%s" % framework for framework in FRAMEWORK_COMPATIBILITY.keys()] +
              ["@rules_dotnet//dotnet:rid_compatible_%s" % rid for rid in RUNTIME_GRAPH.keys()],
)
