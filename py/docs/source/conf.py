# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.


import importlib
import inspect
import os
import os.path
import sys

# If extensions (or modules to document with autodoc) are in another directory,
# add these directories to sys.path here. If the directory is relative to the
# documentation root, use os.path.abspath to make it absolute, like shown here.
# sys.path.insert(0, os.path.abspath('.'))
sys.path.insert(0, os.path.join(os.getcwd(), "..", ".."))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "_ext"))

# -- General configuration -----------------------------------------------------

# If your documentation needs a minimal Sphinx version, state it here.
# needs_sphinx = '1.0'

# Add any Sphinx extension module names here, as strings. They can be extensions
# coming with Sphinx (named 'sphinx.ext.*') or your custom ones.
extensions = [
    "sphinx.ext.autodoc",
    "sphinx.ext.autosummary",
    "sphinx.ext.intersphinx",
    "sphinx.ext.linkcode",
    "sphinx.ext.napoleon",
    "llm_assets",
]

# Extension configuration.
autoclass_content = "both"
autodoc_typehints = "description"
autodoc_typehints_format = "short"
autodoc_default_options = {
    "members": True,
    "member-order": "bysource",
    "show-inheritance": True,
    "undoc-members": True,
    "inherited-members": True,
}
napoleon_google_docstring = True
napoleon_numpy_docstring = False

# Resolve types borrowed from the standard library and from our dependencies to
# their own documentation, so a reader landing on a signature can follow every
# name in it instead of guessing.
intersphinx_mapping = {
    "python": ("https://docs.python.org/3", None),
    "trio": ("https://trio.readthedocs.io/en/stable", None),
    "urllib3": ("https://urllib3.readthedocs.io/en/stable", None),
}
# Inventories are fetched over the network. A build without one degrades to
# plain literals rather than failing, and the timeout keeps it from stalling.
intersphinx_timeout = 5

# Add any paths that contain templates here, relative to this directory.
templates_path = ["_templates"]

# The suffix of source filenames.
source_suffix = ".rst"

# The encoding of source files.
# source_encoding = 'utf-8-sig'

# The master toctree document.
master_doc = "index"

# General information about the project.
project = "Selenium"
copyright = "Copyright 2004-2011 Selenium committers, 2011-2026 Software Freedom Conservancy"

# The version info for the project you're documenting, acts as replacement for
# |version| and |release|, also used in various other places throughout the
# built documents.
#
# The short X.Y version.
version = "4.48"
# The full version, including alpha/beta/rc tags.
release = "4.48.0.202608101808"

# A released version corresponds to a tag; a nightly does not, so its links point
# at trunk. Used to build source links and to describe this build to machines.
_is_release = release.count(".") == 2
git_ref = f"selenium-{release}" if _is_release else "trunk"


def linkcode_resolve(domain, info):
    """Point each documented object at its source on GitHub.

    Source links used to be served from copies of the source rendered into this
    site, which meant every module existed twice on the web with no indication of
    which was canonical. Linking to the repository at the ref this build came
    from keeps one copy authoritative and gives the reader somewhere to go with
    history, blame and issues attached.
    """
    if domain != "py" or not info.get("module"):
        return None

    try:
        obj = importlib.import_module(info["module"])
        for part in info["fullname"].split("."):
            obj = getattr(obj, part)
        # Much of the driver surface is exposed as properties, whose source lives
        # on the getter rather than on the descriptor.
        if isinstance(obj, property):
            obj = obj.fget
        obj = inspect.unwrap(obj)
        source_file = inspect.getsourcefile(obj)
        _, lineno = inspect.getsourcelines(obj)
    except (ImportError, AttributeError, OSError, TypeError):
        return None

    if not source_file:
        return None

    # `selenium` is the top of the published package, and also the top of the
    # `py` directory in the repository.
    path = source_file.replace(os.sep, "/")
    if "/selenium/" not in path:
        return None
    relative = "selenium/" + path.rsplit("/selenium/", 1)[1]

    return f"https://github.com/SeleniumHQ/selenium/blob/{git_ref}/py/{relative}#L{lineno}"


# The language for content autogenerated by Sphinx. Refer to documentation
# for a list of supported languages.
# language = None

# There are two options for replacing |today|: either, you set today to some
# non-false value, then it is used:
# today = ''
# Else, today_fmt is used as the format for a strftime call.
# today_fmt = '%B %d, %Y'

# List of patterns, relative to source directory, that match files and
# directories to ignore when looking for source files.
exclude_patterns = []

# The reST default role (used for this markup: `text`) to use for all documents.
# default_role = None

# If true, '()' will be appended to :func: etc. cross-reference text.
# add_function_parentheses = True

# If true, the current module name will be prepended to all description
# unit titles (such as .. function::).
add_module_names = False

# If true, sectionauthor and moduleauthor directives will be shown in the
# output. They are ignored by default.
# show_authors = False

# A list of ignored prefixes for module index sorting.
# modindex_common_prefix = []


# -- Options for HTML output ---------------------------------------------------

# The canonical home of this reference. Several copies of the Python API docs
# are published — the release build here, a per-commit preview on Read the Docs,
# and unofficial mirrors that outrank both — and until now none of them said
# which was authoritative. Setting this emits `rel="canonical"` on every page,
# pointing search engines and retrieval pipelines at the released reference no
# matter which copy they reached. Preview builds that are not served from this
# base should override it with `-D html_baseurl=` (see `py/docs/README.rst`).
html_baseurl = "https://www.selenium.dev/selenium/docs/api/py/"

# The theme to use for HTML and HTML Help pages
html_theme = "pydata_sphinx_theme"

# Theme options are theme-specific and customize the look and feel of a theme
# further.  For a list of options available for each theme, see the
# documentation.
html_theme_options = {
    "pygments_light_style": "tango",
    "pygments_dark_style": "monokai",
    "primary_sidebar_end": [],
    "show_toc_level": 1,
    "navbar_end": [
        "theme-switcher",
        "navbar-icon-links",
    ],
    "icon_links": [
        {
            "name": "GitHub",
            "url": "https://github.com/SeleniumHQ/selenium",
            "icon": "fa-brands fa-github",
        },
        {
            "name": "PyPI",
            "url": "https://pypi.org/project/selenium",
            "icon": "fa-brands fa-python",
        },
    ],
}

# Add any paths that contain custom themes here, relative to this directory.
# html_theme_path = []

# The name for this set of Sphinx documents.  If None, it defaults to
# "<project> v<release> documentation".
# html_title = None

# A shorter title for the navigation bar.  Default is the same as html_title.
# html_short_title = None

# The name of an image file (relative to this directory) to place at the top
# of the sidebar.
# html_logo = ''

# The name of an image file (within the static path) to use as favicon of the
# docs.  This file should be a Windows icon file (.ico) being 16x16 or 32x32
# pixels large.
# html_favicon = None

# Add any paths that contain custom static files (such as style sheets) here,
# relative to this directory. They are copied after the builtin static files,
# so a file named "default.css" will overwrite the builtin "default.css".
html_static_path = []

# Files copied verbatim into the output root. `_extra/deprecations.json` is
# generated by `generate_deprecations.py`; publishing it beside the HTML gives
# tooling one stable URL for "this API is gone, use that instead".
html_extra_path = ["_extra"]

# If not '', a 'Last updated on:' timestamp is inserted at every page bottom,
# using the given strftime format.
# html_last_updated_fmt = '%b %d, %Y'

# If true, SmartyPants will be used to convert quotes and dashes to
# typographically correct entities.
# html_use_smartypants = True

# Custom sidebar templates, maps document names to template names.
html_sidebars = {
    "**": [],
}

# Additional templates that should be rendered to pages, maps page names to
# template names.
# html_additional_pages = {}

# If false, no module index is generated.
html_domain_indices = True

# If false, no index is generated.
html_use_index = True

# If true, the index is split into individual pages for each letter.
html_split_index = True

# The reST sources are generated autosummary stubs — a link to them shows a
# reader an `automodule` directive, not the source they were looking for.
# `linkcode_resolve` above puts a source link on the objects themselves instead.
html_show_sourcelink = False

# If true, "Created using Sphinx" is shown in the HTML footer. Default is True.
html_show_sphinx = False

# If true, "(C) Copyright ..." is shown in the HTML footer. Default is True.
# html_show_copyright = True

# If true, an OpenSearch description file will be output, and all pages will
# contain a <link> tag referring to it.  The value of this option must be the
# base URL from which the finished HTML is served.
# html_use_opensearch = ''

# This is the file name suffix for HTML files (e.g. ".xhtml").
# html_file_suffix = None

# Output file base name for HTML help builder.
htmlhelp_basename = "Seleniumdoc"
