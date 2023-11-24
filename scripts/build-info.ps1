$revision = (git rev-parse --short HEAD)
$dirtyout = (git status --porcelain --untracked-files=no)
if ($dirtyout -eq $null) {
    $dirty = ""
} else {
    $dirty = "*"
}
echo "STABLE_GIT_REVISION $revision$dirty"
