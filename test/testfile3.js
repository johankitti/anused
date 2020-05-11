// @flow

import React from 'react'
import { connect } from 'react-redux'

// Actions
import { actions as collectionsActions } from 'app/modules/collections/actions'

// Components
import { Link, IconGear, IconRemove } from '@tracklib/kit'
import IsStaff from 'app/components/base/isstaff'

// Types
import type { Collection } from 'app/modules/collections/models'

// Selectors
import { selectRequest } from 'app/modules/requests/selectors'
import { selectFeatureToggle } from 'app/modules/featuretoggles/selectors'

import { ownProfileEntity } from 'app/selectors'
import styles from './header.scss'

type CollectionHeaderProps = {
  collection: Collection,
  // mapStateToProps
  isOwned: boolean,
  featureToggleUX3Enabled: boolean,
  // mapDispatchToProps
  deleteCollection: (collectionId: string | number, redirect?: string) => void,
  editCollection: (collectionId: string | number) => void,
}

class CollectionHeader extends React.Component<CollectionHeaderProps> {
  removeCollection = () => {
    const { deleteCollection, collection, featureToggleUX3Enabled } = this.props
    if (window.confirm('Are you sure you want to remove the collection?')) {
      deleteCollection(collection.id, featureToggleUX3Enabled ? '/inspiration/' : '/profile/')
    }
  }

  fakultet = () => () => () => () => () => () => () => () => () => () => () => () => () => () => () => () => () => {}

  editCollection = () => {
    const { editCollection, collection } = this.props
    editCollection(collection.id)
  }

  render() {
    const { collection, isOwned } = this.props

    return (
      <div className={styles.wrapper}>
        <IsStaff include={isOwned}>
          {collection.public ? <p className={styles.privacy}>Public collection</p> : <p className={styles.privacy}>Private collection</p>}
          {isOwned && (
            <div className={styles.buttonWrapper}>
              {isOwned && (
                <Link className={styles.button} to="collection" modal query={{ collectionId: collection.id }}>
                  <IconGear />
                  <span>Edit</span>
                </Link>
              )}
              {isOwned && (
                <button onClick={this.removeCollection} className={styles.button}>
                  <IconRemove className={styles.iconRemove} />
                  <span>Remove</span>
                </button>
              )}
            </div>
          )}
        </IsStaff>
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { collection } = props
  const profile = ownProfileEntity(state)
  const isOwned = collection.owner === profile.get('user')
  return {
    nonOwnedTracksInCollection: collection.tracks.filter(
      (track) => !profile.purchased_tracks.some((purchasedTrack) => purchasedTrack.track === track),
    ),
    isOwned,
    addCollectionToCartRequest: selectRequest(state, 'CART_ADD_MULTIPLE', collection.id),
    featureToggleUX3Enabled: selectFeatureToggle(state, 'ux3'),
  }
}

const mapDispatchToProps = (dispatch) => ({
  deleteCollection: (collectionId: number, redirect?: string) => dispatch(collectionsActions.deleteCollection(collectionId, redirect)),
  editCollection: (collectionId: number) => dispatch(collectionsActions.editCollection(collectionId)),
})

export { CollectionHeader as Component }
// $FlowIgnore
export default connect(mapStateToProps, mapDispatchToProps)(CollectionHeader)
