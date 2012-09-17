#!/bin/sh
python ../closure-library/closure/bin/calcdeps.py \
    --path ../closure-library \
    --path . \
    --input export.js \
    --compiler_jar ../closure-compiler/build/compiler.jar \
    --output_mode compiled \
    --compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" \
    --compiler_flags="--output_wrapper=(function(){%output%})()" \
    --compiler_flags="--use_types_for_optimization" \
    > wgxpath.install.js