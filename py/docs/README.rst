==========================
About Python Documentation
==========================

This directory, ``py/docs``, is the source for the API Reference Documentation
and basic Python documentation as well as the main README for the GitHub and
PyPI package.


How to build docs
=================

.. code-block:: console

    ./go py:docs_generate


After building, docs are available in `bazel-bin/py/docs/_build/html/`
