def _add_maven_coords(tags, coords):
    tags.append("maven_coordinates=" + coords)
    return tags

def maven_java_import(name, coords, jar, srcjar = None, visibility = None, deps = None):
    native.java_import(
        name = name,
        tags = _add_maven_coords([], coords),
        jars = [jar],
        srcjar = srcjar,
        visibility = visibility,
        deps = deps,
        exports = deps,
    )

def maven_java_library(name, coords, **kwargs):
    tags = _add_maven_coords(kwargs.pop("tags", default = []), coords)
    native.java_library(
        name = name,
        tags = tags,
        **kwargs
    )
