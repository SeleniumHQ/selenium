
def java_library(name, module_info=None, deps=[], visibility=[], **kwargs):
  if module_info:
    native.genrule(
      name = "%s-generate-module-info" % name,
      srcs = [ module_info ],
      out = 'module-info.jar',
      cmd = "$(exe //java/client/src/org/openqa/selenium/tools:module-maker) $SRCS $OUT"
    )

    native.prebuilt_jar(
      name = "%s-module-info" % name,
      binary_jar = ":%s-generate-module-info" % name,
      visibility = visibility,
    )

    deps += [ ":%s-module-info" % name ]

  native.java_library(
    name=name,
    deps=deps,
    visibility=visibility,
    **kwargs)

