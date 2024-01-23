# 1. Open PowerShell as an Administrator
# 2. Change directory to where you want Selenium repo to be cloned to
# 3. Execute: `Set-ExecutionPolicy Bypass -Scope Process -Force`
# 4. Run this script in the PowerShell terminal

Function Install-ChocoPackage {
  param (
    [string]$PackageName,
    [string]$ExecutableName,
    [string]$AdditionalParams = ""
  )

  Write-Host "Checking installation of $PackageName"
  if (-Not (Get-Command $ExecutableName -ErrorAction SilentlyContinue)) {
    Write-Host "Installing $PackageName..."
    choco install $PackageName -y $AdditionalParams
    refreshenv -Path ...
  } else {
    Write-Host "$PackageName is already installed."
  }
}

Function Install-JDK17 {
  $javacInstalled = Get-Command javac -ErrorAction SilentlyContinue
  $javaVersion = if ($javacInstalled) { & javac -version 2>&1 | Select-String -Pattern '"(\d+)' | ForEach-Object { $_.Matches.Groups[1].Value } }

  if (-Not $javacInstalled -or [int]$javaVersion -ne 17) {
    Install-ChocoPackage -PackageName "openjdk17" -ExecutableName "javac"
  } else {
    Write-Host "JDK 17 is already installed."
  }
}

Function Set-JavaEnvironmentVariable {
  $javacPath = Get-ChildItem -Path 'C:\Program Files\' -Recurse -Filter 'javac.exe' | Select-Object -First 1 -ExpandProperty DirectoryName
  $javaHome = Split-Path -Path $javacPath
  Write-Host "Set JAVA_HOME environment variable to $javaHome"
  [System.Environment]::SetEnvironmentVariable('JAVA_HOME', $javaHome, [System.EnvironmentVariableTarget]::Machine)
  refreshenv -JAVA_HOME ...
}

Function Update-EnvironmentVariables {
  Param ([string]$VariableName, [string]$Value)
  $currentValue = [Environment]::GetEnvironmentVariable($VariableName, [EnvironmentVariableTarget]::User)
  if (-not $currentValue -or $currentValue -ne $Value) {
    Write-Host "Setting $VariableName to $Value"
    [Environment]::SetEnvironmentVariable($VariableName, $Value, [System.EnvironmentVariableTarget]::User)
    refreshenv -$VariableName ...
  } else {
    Write-Host "$VariableName is already set to $currentValue"
  }
}

Function Clone-Repository {
  param (
    [string]$RepoUrl
  )
  $cloneChoice = Read-Host "Do you want to clone the repository at $RepoUrl (Y/N)"
  if ($cloneChoice -eq 'Y' -or $cloneChoice -eq 'y') {
    Write-Host "Cloning the repository from $RepoUrl into the current directory"
    $cloneOptions = ""
    $depthChoice = Read-Host -Prompt "Do you want [C]omplete or [S]hallow clone?"
    if ($depthChoice -ne 'C' -and $depthChoice -ne 'c') {
      $cloneOptions = "--depth=1"
    }

    $gitPath = "C:\Program Files\Git\bin\git.exe"
    Write-Host "$gitPath clone $RepoUrl $cloneOptions"
    & $gitPath clone $RepoUrl $cloneOptions
  }
}

Function Install-IntelliJ {
  Install-ChocoPackage -PackageName "intellijidea-community" -ExecutableName "idea64"

  $ideaPath = Get-ChildItem -Path "C:\Program Files\JetBrains" -Filter idea64.exe -Recurse -ErrorAction SilentlyContinue -Force | Select-Object -First 1 -ExpandProperty FullName
  & $ideaPath installPlugins "com.google.idea.bazel.ijwb"
  & $ideaPath installPlugins "google-java-format"

  Write-Host "Setting up Java Format IntelliJ plugin"

  $ideaDirectory = Split-Path -Path $ideaPath -Parent
  $intelliJInstallationFolder = Split-Path -Path $ideaDirectory -Parent
  $fullVersion = (Split-Path -Path $intelliJInstallationFolder -Leaf) -replace "IntelliJ IDEA Community Edition ", ""
  $intelliJVersionName = "IdeaIC" + (($fullVersion -split '\.')[0,1] -join '.')
  $ideaDataPath = Join-Path -Path $env:APPDATA -ChildPath "JetBrains\$intelliJVersionName"

  if (-not (Test-Path -Path $ideaDataPath)) {
    New-Item -ItemType Directory -Path $ideaDataPath -Force | Out-Null
  }

  $vmOptionsFilePath = Join-Path -Path $ideaDataPath -ChildPath "idea64.exe.vmoptions"
  if (-not (Test-Path -Path $vmOptionsFilePath)) {
    New-Item -ItemType File -Path $vmOptionsFilePath | Out-Null
  }
  $linesToAdd = @(
    "--add-exports=jdk.compiler/com.sun.tools.javac.api=ALL-UNNAMED",
    "--add-exports=jdk.compiler/com.sun.tools.javac.code=ALL-UNNAMED",
    "--add-exports=jdk.compiler/com.sun.tools.javac.file=ALL-UNNAMED",
    "--add-exports=jdk.compiler/com.sun.tools.javac.parser=ALL-UNNAMED",
    "--add-exports=jdk.compiler/com.sun.tools.javac.tree=ALL-UNNAMED",
    "--add-exports=jdk.compiler/com.sun.tools.javac.util=ALL-UNNAMED"
  )
  Add-Content -Path $vmOptionsFilePath -Value $linesToAdd
}

Write-Host "Set Execution Policy for future processes; (Ignore Warning)"
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned

Write-Host "Enable Developer Mode"
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock" /t REG_DWORD /f /v "AllowDevelopmentWithoutDevLicense" /d "1"

Write-Host "Install Chocolatey if not already installed"
if (-Not (Get-Command choco -ErrorAction SilentlyContinue)) {
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
}

Install-JDK17
Set-JavaEnvironmentVariable
Install-ChocoPackage -PackageName "git" -ExecutableName "git"
Install-ChocoPackage -PackageName "bazelisk" -ExecutableName "bazel"
Install-ChocoPackage -PackageName "msys2" -ExecutableName "C:\tools\msys64\usr\bin\bash.exe" -AdditionalParams "--params '/InstallDir=C:\tools\msys64'"
Update-EnvironmentVariables -VariableName "PATH" -Value "C:\tools\msys64\usr\bin"
Update-EnvironmentVariables -VariableName "BAZEL_SH" -Value "C:\tools\msys64\usr\bin\bash.exe"
Install-ChocoPackage -PackageName "visualstudio2022community" -ExecutableName "devenv"

Start-Process "C:\Program Files (x86)\Microsoft Visual Studio\Installer\setup.exe"
Read-Host -Prompt "Install C++ in Visual Studio then Press Enter to continue"

$bazelVcPath = "C:\Program Files\Microsoft Visual Studio\2022\Community\VC"
Update-EnvironmentVariables -VariableName "BAZEL_VC" -Value $bazelVcPath

$vcToolsPath = Get-ChildItem -Path "$bazelVcPath\Tools\MSVC" | Sort-Object Name -Descending | Select-Object -First 1
$vcToolsVersion = $vcToolsPath.Name
Update-EnvironmentVariables -VariableName "BAZEL_VC_FULL_VERSION" -Value $vcToolsVersion

Clone-Repository -RepoUrl "https://github.com/SeleniumHQ/selenium.git"

$longPathSupport = Read-Host "Do you want to change settings to better manage long file paths (recommended) (Y/N)"
if ($longPathSupport -eq 'Y' -or $longPathSupport -eq 'y')
{
  Write-Host "Enable UNC Path support"
  reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Command Processor" /t REG_DWORD /f /v "DisableUNCCheck" /d "1"

  Write-Host "Enable Long Path support"
  reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\FileSystem" /t REG_DWORD /f /v "LongPathsEnabled" /d "1"

  Write-Host "Enable creating short name versions of long file paths"
  fsutil 8dot3name set 0

  Write-Host "Set bazel output to C:/tmp instead of nested inside project directory"
  $currentDirectory = Get-Location
  $filePath = [System.IO.Path]::Combine($currentDirectory, "selenium/.bazelrc.windows.local")
  $text = "startup --output_user_root=C:/tmp"
  $encoding = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($filePath, $text, $encoding)
}

$intelliJChoice = Read-Host "Do you want to install and setup IntelliJ (Y/N)"
if ($intelliJChoice -eq 'Y' -or $intelliJChoice -eq 'y')
{
  Install-IntelliJ
}

$restartChoice = Read-Host "Do you want to restart the computer now? (Y/N)"
if ($restartChoice -eq 'Y' -or $restartChoice -eq 'y') {
  Restart-Computer
}
