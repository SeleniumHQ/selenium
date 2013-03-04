#!/bin/bash

set -e
[ -n "$DEBUG" ] && set -x


if [[ $# -lt 1 ]] || [[ $# -gt 2 ]] ; then
  echo "usage: $0 <gem-name> [version]"
  exit 0
fi

JAVA=$(which java)
GEM=$1
GEM_VERSION=$2

ROOT="$(dirname $0)"
JRUBY="${ROOT}/jruby-complete.jar"
GEM_TMP="${ROOT}/${GEM}_tmp"
TARGET="${ROOT}/gems/${GEM}.jar"

rm -rf $GEM_TMP
mkdir -p $GEM_TMP

INSTALL_ARGS="--verbose -i $GEM_TMP --no-rdoc --no-ri $GEM"
[[ "$GEM_VERSION" == "" ]] || INSTALL_ARGS="--version $GEM_VERSION $INSTALL_ARGS"

# unset PATH to force use of jruby's internal `gem` command
# AFAIK there's no other way since they force use of -S
PATH='' $JAVA -jar $JRUBY -S gem install $INSTALL_ARGS

if [[ "$GEM" == "albacore" ]]; then
  echo 'Patching albacore. Remove this when https://github.com/Albacore/albacore/pull/45 is merged + released'
  cd "${GEM_TMP}/gems/albacore"-*
  
  patch -p1 <<END
diff --git a/lib/albacore.rb b/lib/albacore.rb
index bbe5357..d75afee 100644
--- a/lib/albacore.rb
+++ b/lib/albacore.rb
@@ -6,4 +6,36 @@ $: << File.join(albacore_root, "albacore", 'config')
 
 IS_IRONRUBY = (defined?(RUBY_ENGINE) && RUBY_ENGINE == "ironruby")
 
-Dir.glob(File.join(albacore_root, 'albacore/*.rb')).each {|f| require f }
+require "albacore/albacoretask"
+require "albacore/aspnetcompiler"
+require "albacore/assemblyinfo"
+require "albacore/csc"
+require "albacore/docu"
+require "albacore/exec"
+require "albacore/fluentmigratorrunner"
+require "albacore/ilmerge"
+require "albacore/msbuild"
+require "albacore/msdeploy"
+require "albacore/mspectestrunner"
+require "albacore/mstesttestrunner"
+require "albacore/nant"
+require "albacore/nchurn"
+require "albacore/ncoverconsole"
+require "albacore/ncoverreport"
+require "albacore/ndepend"
+require "albacore/nugetinstall"
+require "albacore/nugetpack"
+require "albacore/nugetpublish"
+require "albacore/nugetpush"
+require "albacore/nugetupdate"
+require "albacore/nunittestrunner"
+require "albacore/nuspec"
+require "albacore/output"
+require "albacore/plink"
+require "albacore/specflowreport"
+require "albacore/sqlcmd"
+require "albacore/unzip"
+require "albacore/vssget"
+require "albacore/xbuild"
+require "albacore/xunittestrunner"
+require "albacore/zipdirectory"
END

  cd -
fi

jar cf $TARGET -C $GEM_TMP .
rm -r $GEM_TMP

echo "Created $TARGET"