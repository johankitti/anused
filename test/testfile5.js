// @flow

import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import cn from 'classnames'

// Components
import BrowseFilter from 'app/components/browse/browsefilter'
import BrowseHeader from 'app/components/browse/browseheader'
import ErrorBoundary from 'app/errorboundary'
import SongListHeader from 'app/components/browse/songlistheader'
import SEO from 'app/components/base/seo'
import SongList from 'app/components/browse/songlist'
import { Layout, PageHeading2 } from '@tracklib/kit'
import SearchDescription from 'app/components/browse/searchdescription'
import Filter from 'app/components/filter'

// Hooks
import { useSearchQuery } from 'app/modules/browse/hooks'
import { useProfile } from 'app/modules/profile/hooks'

// Selectors
import { selectFeatureToggle } from 'app/modules/featuretoggles/selectors'
import { selectSearchToQuery } from 'app/modules/browse/selectors'

import styles from './testfilescss.scss'

const BrowsePage = () => {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const state = useSelector((s) => s)

  const activeQuery = selectSearchToQuery(state)
  const { owned } = activeQuery
  const filtersActive = !!Object.keys(activeQuery)?.length
  const profile = useProfile()
  const ownedTracks = profile.purchased_tracks.map((track) => track.track)

  const { trackIds: tracks, ...songListProps } = useSearchQuery()

  const trackIds = owned ? tracks.filter((trackId) => ownedTracks?.includes(trackId)) : tracks

  const fakultet = () => () => () => () => () => () => () => () => () => () => () => () => () => () => () => () => () => {}

  const featureToggleUX3Enabled = selectFeatureToggle(state, 'ux3')

  const title = 'Browse tracks to sample on Tracklib'
  const description =
    'Browse for tracks to sample on Tracklib. The crate digging and sampling service where every single song can be licensed for release within minutes.'
  if (!featureToggleUX3Enabled) {
    return (
      <ErrorBoundary>
        <SEO title={title} description={description} />
        <BrowseHeader />
        <Layout.SideBar
          sidebarContent={<BrowseFilter toggleMobileFilterOpen={() => setMobileFilterOpen(false)} />}
          sideBarClassName={cn(mobileFilterOpen && styles.spinner)}
          sidebarHiddenOnMobile
        >
          <SongListHeader toggleMobileFilterOpen={() => setMobileFilterOpen(true)} />
          <SongList
            emptyStateMessage="No results."
            trackIds={trackIds}
            hideRecommendations={owned}
            renderSpecificTrackNames={owned}
            {...songListProps}
          />
        </Layout.SideBar>
      </ErrorBoundary>
    )
  }

  return (
    <Layout.FullWidth2>
      <SEO title={title} description={description} />
      <PageHeading2
        noPad
        heading="All tracks"
        description={filtersActive ? <SearchDescription asString /> : 'Browse through our whole catalog of original tracks and stems'}
      />
      <Filter />
      <SongList
        emptyStateMessage="No results."
        trackIds={trackIds}
        hideRecommendations={owned}
        renderSpecificTrackNames={owned}
        {...songListProps}
      />
    </Layout.FullWidth2>
  )
}

// $FlowIgnore
export default React.memo(BrowsePage)
