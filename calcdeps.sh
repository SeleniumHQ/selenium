#!/bin/bash
#
# A wrapper script for regenerating ./common/test/js/deps.js.
# TODO(jmleyba): Integrate this with the Rakefile.
#
# Author: jmleyba@gmail.com (Jason Leyba)

readonly ROOT="$(cd `dirname $0` && pwd)"
readonly CLOSURE="${ROOT}/third_party/closure"
readonly CALCDEPS="${CLOSURE}/bin/calcdeps.py"
readonly GOOG_DIR="${CLOSURE}/goog"
readonly JS_RELATIVE_SRC="../../../common/src/js"
readonly JS_RELATIVE_TEST="../../../common/test/js"
readonly OUTPUT_FILE="${ROOT}/common/test/js/deps.js"

main() {
  cd "${GOOG_DIR}"
  local command=""
  command=( "${CALCDEPS}" )
  command=( "${command[@]}" "--output_mode=deps" )
  command=( "${command[@]}" "--path=${JS_RELATIVE_SRC}" )
  command=( "${command[@]}" "--path=${JS_RELATIVE_TEST}" )

  echo
  count=${#command[@]}
  for ((i=0; i < $count; i++)); do
    echo "${command[$i]} \\"
  done
  echo

  # Generate the deps. The file paths will be as they appear on the filesystem,
  # but for our tests, the WebDriverJS source files are served from /js/src and
  # the Closure Library source is under /third_party/closure/goog, so we need
  # to modify the generated paths to match that scheme.
  "${command[@]}" | sed "s/common\/\(.*\)\/js/js\/\1/" > ${OUTPUT_FILE}
}

main $*

