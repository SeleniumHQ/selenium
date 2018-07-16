
def java_module(
  name,
  module_info,
  maven_coords,
  maven_pom_template=None,
  manifest_file=None,
  srcs=[],
  deps=[],
  visibility=[]):

  javac = read_config('tools', 'javac9', 'javac')

  # Remove module-info if necessary from sources
  srcs.remove(module_info)

  library_name = name + '-lib'
  native.java_library(
    name = library_name,
    manifest_file = manifest_file,
    srcs =  srcs,
    deps = deps,
  )

  # We need the entire maven jar in order to have everything work.
  mod_info_name = name + '-mod-info'
  native.genrule(
    name = mod_info_name,
    out = 'module-info.java',
    srcs = [ module_info ],
    cmd = "mkdir temp && cd temp && jar xf $(location :%s#uber) && %s -source 9 -target 9 -d . $SRCS && cp module-info.class $OUT" % (library_name, javac),
  )

  # Now we have the module-info, spanner it into the actual jar
  spanner_name = name + '-lib-and-mod'
  native.genrule(
      name = spanner_name,
      out = "%s.jar" % spanner_name,
      cmd = "cp $(location :%s) $OUT && jar uf $OUT $(location :%s)" % (library_name, mod_info_name)
  )

  prebuilt_name = name + '-prebuilt'
  native.prebuilt_jar(
    name = prebuilt_name,
    binary_jar = ":%s" % spanner_name)

  native.java_library(
    name = name,
    deps = [":%s" % prebuilt_name],
    maven_coords = maven_coords,
    maven_pom_template = maven_pom_template,
    visibility = visibility,
  )
