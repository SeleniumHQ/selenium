#! /usr/bin/env python
# Author: David Goodger
# Contact: goodger@python.org
# Revision: $Revision: 4453 $
# Date: $Date: 2006-03-30 16:31:53 +0200 (Thu, 30 Mar 2006) $
# Copyright: This module has been placed in the public domain.

from docutils import nodes
from docutils.nodes import Element, TextElement, Structural, Inline, Part, \
     Text
import types

# This is the parent class of all the other pynode classes:
class PythonStructural(Structural): pass

# =====================
#  Structural Elements
# =====================

class module_section(PythonStructural, Element): pass    
class class_section(PythonStructural, Element): pass
class class_base(PythonStructural, Element): pass
class method_section(PythonStructural, Element): pass
class attribute(PythonStructural, Element): pass
class function_section(PythonStructural, Element): pass
class class_attribute_section(PythonStructural, Element): pass
class class_attribute(PythonStructural, Element): pass
class expression_value(PythonStructural, Element): pass
class attribute(PythonStructural, Element): pass

# Structural Support Elements
# ---------------------------

class parameter_list(PythonStructural, Element): pass
class parameter_tuple(PythonStructural, Element): pass
class parameter_default(PythonStructural, TextElement): pass
class import_group(PythonStructural, TextElement): pass
class import_from(PythonStructural, TextElement): pass
class import_name(PythonStructural, TextElement): pass
class import_alias(PythonStructural, TextElement): pass
class docstring(PythonStructural, Element): pass

# =================
#  Inline Elements
# =================

# These elements cannot become references until the second
# pass.  Initially, we'll use "reference" or "name".

class object_name(PythonStructural, TextElement): pass
class parameter_list(PythonStructural, TextElement): pass
class parameter(PythonStructural, TextElement): pass
class parameter_default(PythonStructural, TextElement): pass
class class_attribute(PythonStructural, TextElement): pass
class attribute_tuple(PythonStructural, TextElement): pass

# =================
#  Unused Elements
# =================

# These were part of the model, and maybe should be in the future, but
# aren't now.
#class package_section(PythonStructural, Element): pass
#class module_attribute_section(PythonStructural, Element): pass
#class instance_attribute_section(PythonStructural, Element): pass
#class module_attribute(PythonStructural, TextElement): pass
#class instance_attribute(PythonStructural, TextElement): pass
#class exception_class(PythonStructural, TextElement): pass
#class warning_class(PythonStructural, TextElement): pass


# Collect all the classes we've written above
def install_node_class_names():
    node_class_names = []
    for name, var in globals().items():
        if (type(var) is types.ClassType
            and issubclass(var, PythonStructural) \
            and name.lower() == name):
            node_class_names.append(var.tagname or name)
    # Register the new node names with GenericNodeVisitor and
    # SpecificNodeVisitor:
    nodes._add_node_class_names(node_class_names)
install_node_class_names()
