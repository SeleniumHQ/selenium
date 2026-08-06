$revision = (git rev-parse --short HEAD)
$full_revision = (git rev-parse HEAD)
$dirtyout = (git status --porcelain --untracked-files=no)
if ($dirtyout -eq $null) {
    $dirty = ""
} else {
    $dirty = "*"
}
echo "STABLE_GIT_REVISION $revision$dirty"
echo "STABLE_GIT_REVISION_FULL $full_revision$dirty"
