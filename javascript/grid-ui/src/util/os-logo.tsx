import androidLogo from '../assets/operating-systems/android.svg'
import macLogo from '../assets/operating-systems/mac.svg'
import windowsLogo from '../assets/operating-systems/windows.svg'
import linuxLogo from '../assets/operating-systems/linux.svg'
import unknownOsLogo from '../assets/operating-systems/unknown.svg'

const osLogo = (os: string): string => {
  if (os.length === 0) {
    return unknownOsLogo
  }

  const osLowerCase: string = os.toLowerCase()
  if (osLowerCase.includes('win')) {
    return windowsLogo
  }
  if (osLowerCase.includes('android')) {
    return androidLogo
  }
  if (osLowerCase.includes('mac') || osLowerCase.includes('ios')) {
    return macLogo
  }
  if (osLowerCase.includes('nix') || osLowerCase.includes('nux') ||
      osLowerCase.includes('aix')) {
    return linuxLogo
  }
  return unknownOsLogo
}

export default osLogo
