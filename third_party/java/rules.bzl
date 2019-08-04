def _add_maven_coords(tags, coords):
    tags.append("maven_coordinates=" + coords)
    return tags

def maven_java_import(name, coords, jar, srcjar = None, visibility = None, deps = None, **kwargs):
    tags = _add_maven_coords(kwargs.pop("tags", default = []), coords)
    native.java_import(
        name = name,
        tags = tags,
        jars = [jar],
        srcjar = srcjar,
        visibility = visibility,
        deps = deps,
        exports = deps,
        **kwargs
    )

def maven_java_library(name, coords, **kwargs):
    tags = _add_maven_coords(kwargs.pop("tags", default = []), coords)
    native.java_library(
        name = name,
        tags = tags,
        **kwargs
    )
