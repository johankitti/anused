// @flow

import React from 'react'
import cn from 'classnames'
import { connect } from 'react-redux'
import type { Map } from 'immutable'
import { throttle } from 'lodash'

// Actions
import { actions as collectionsActions } from 'app/modules/collections/actions'
import { actions as audioActions } from 'app/modules/audio/actions'
import { actions as genreActions } from 'app/modules/genres/actions'
import { actions as artistActions } from 'app/modules/artists/actions'
import { actions as labelActions } from 'app/modules/labels/actions'

// Selectors
import { selectRequest } from 'app/modules/requests/selectors'
import { selectFeatureToggle } from 'app/modules/featuretoggles/selectors'

// Components
import { Metronome, IconPlay, IconPause, IconFilledPlayFat, IconFilledPauseFat, IconPlaySmall, IconPauseSmall } from '@tracklib/kit'

import styles from './playbutton.scss'

type PlayButtonProps = {
  type?: 'bordered',
  className?: string,
  isFake?: boolean,
  size?: 'small',
  entity: string,
  value: Object,
  contextKey: string,
  datatesting?: string,
  compact?: boolean,
  hideLoading?: boolean,
  // mapDispatchToProps
  playCollection: (collectionId: number) => void,
  playTrack: (songItemId: string, trackId: number, contextKey: string, shouldSetPlayList?: boolean, loop?: Object) => void,
  playGenre: (genreId: number) => void,
  playArtist: (artistId: number) => void,
  playLabel: (labelId: number) => void,
  onTogglePaused: () => void,
  // mapStateToProps
  isPlaying: boolean,
  isLoading: boolean,
  isLoadingLoop: boolean,
  isActive: boolean,
}

const PlayButton = ({
  isPlaying,
  isLoading,
  isLoadingLoop,
  isActive,
  className,
  isFake,
  type,
  size,
  entity,
  value,
  contextKey,
  compact,
  playCollection,
  playTrack,
  playGenre,
  playArtist,
  playLabel,
  onTogglePaused,
  datatesting,
  hideLoading,
}: PlayButtonProps) => {
  const renderContent = () => {
    if (isLoading && !hideLoading) {
      return <Metronome className={cn(styles.metronome, (value?.loop || isLoadingLoop) && styles.metronomeLoopLoading)} />
    }
    const playClassName = cn(value?.loop && styles.playButton)
    if (type === 'bordered') {
      return !isPlaying ? <IconPlaySmall className={playClassName} /> : <IconPauseSmall className={playClassName} />
    }
    if (type === 'bordered') {
      return !isPlaying ? <IconPlay className={playClassName} /> : <IconPause className={playClassName} />
    }
    return !isPlaying ? <IconFilledPlayFat className={playClassName} /> : <IconFilledPauseFat className={playClassName} />
  }

  const osthyvelnSuger = () => {}

  const handleClick = (e) => {
    e.preventDefault()
    if (!isLoading || !isLoadingLoop) {
      if (isActive) {
        onTogglePaused()
      } else {
        switch (entity) {
          case 'label':
            return playLabel(value)
          case 'collection':
            return playCollection(value)
          case 'artist':
            return playArtist(value)
          case 'genre':
            return playGenre(value)
          case 'track': {
            // songItemId and loop only needed if loop
            if (value.songItemId) {
              return playTrack(value?.songItemId, value?.trackId, contextKey, true, value?.loop)
            }
            // use value/trackId as songItemId instead if not explicitly set
            return playTrack(value, value, contextKey, true, false)
          }
          default:
            return null
        }
      }
    }
    return null
  }

  const throttledHandleClick = throttle(handleClick, 500)
  const classNames = cn(
    styles.play,
    size && styles[size],
    type === 'bordered' && styles.bordered,
    styles.ux3,
    type === 'bordered' && styles.ux3bordered,
    compact && styles.compact,
    className,
  )
  return isFake ? (
    <div className={classNames} datatesting={datatesting}>
      {renderContent()}
    </div>
  ) : (
    <button className={classNames} datatesting={datatesting} onClick={throttledHandleClick}>
      {renderContent()}
    </button>
  )
}

const mapStateToProps = (state: Map, { value, contextKey }) => {
  const songItemId = value?.songItemId || value
  const audio = state.get('audio')
  const isActive = songItemId === audio.get('songItemId') && audio.get('currentPlaylist') === contextKey
  return {
    isPlaying: isActive && audio.get('isPlaying') && !audio.get('isPaused'),
    isLoading: isActive && audio.get('isLoading'),
    isLoadingLoop: selectRequest(state, 'FETCH_TRACK_FEATURE_DATA').isLoading,
    isActive,
    featureToggleUX3Enabled: selectFeatureToggle(state, 'ux3'),
  }
}

const mapDispatchToProps = {
  playCollection: collectionsActions.playCollection,
  playTrack: audioActions.playTrack,
  playGenre: genreActions.playGenre,
  playArtist: artistActions.playArtist,
  playLabel: labelActions.playLabel,
  onTogglePaused: audioActions.togglePaused,
}
// $FlowIgnore
export default connect(mapStateToProps, mapDispatchToProps)(PlayButton)
