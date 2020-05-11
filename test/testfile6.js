// @flow

import { useSelector } from 'react-redux'
import Cookie from 'js-cookie'
import { isBrowser } from 'app/process'

// Hooks
import { useIsAuthenticated } from 'app/modules/auth/hooks'

// Types
import { Profile } from 'app/modules/profile/models'

export const useProfile = () => {
  const profileId = useSelector((state) => state.getIn(['auth', 'profileId']))
  const profile = useSelector((state) => state.getIn(['entities', 'profile', String(profileId)]))
  return profile || new Profile()
}

export const useTheme = () => {
  const isAuthenticated = useIsAuthenticated()
  const profile = useProfile()

  if (!isAuthenticated) {
    if (isBrowser) {
      Cookie.set('theme', 'light')
    }
    return 'light'
  }
  if (profile?.get('dark_mode')) {
    if (isBrowser) {
      Cookie.set('theme', 'dark')
    }
    return 'dark'
  }
  return null
}

export const useDarkMode = () => {
  const theme = useTheme()
  return theme === 'dark'
}
