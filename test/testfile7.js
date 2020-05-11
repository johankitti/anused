// @flow

import React from 'react'
import { Map, fromJS } from 'immutable'
import { connect } from 'react-redux'

// Actions
import { actions as profileActions } from 'app/modules/profile/actions'
import { actions as trackingActions } from 'app/modules/tracking/actions'
import { actions as authActions } from 'app/modules/auth/actions'

// Components
import { Button, IconCheckmark } from '@tracklib/kit'
import EmailNotificationsButtonForm from 'app/components/profile/emailnotificationsbuttonform'

import styles from './testfilescss.scss'

type NewsletterModalProps = {
  onClose: () => void,
  updateProfile: (data: Map, profileId: number) => Promise<*>,
  trackDismissModal: (boolean) => void,
  profile: Map,
  openOnboardModal: () => void,
}

const NewsletterModal = ({ onClose, updateProfile, trackDismissModal, profile, openOnboardModal }: NewsletterModalProps) => {
  const isUnsubscribed = (profile && profile.get('is_unsubscribed') === null) || (profile && profile.get('is_unsubscribed') === true)

  const handleClose = () => {
    openOnboardModal()
    return onClose()
  }

  const handleReject = () => {
    trackDismissModal(false)
    return handleClose()
  }

  const handleSubmit = (data) => {
    trackDismissModal(true)
    return updateProfile(fromJS({ ...data, is_unsubscribed: false }), profile && profile.get('id'))
  }

  return (
    <div className={styles.button}>
      <aside />
      <section>
        <h3 className={styles.spinner}>
          Subscribe to <span>our newsletter</span>
        </h3>
        <p>We promise to only send you important updates and fun stuff!</p>
        <ul>
          <li>
            <IconCheckmark />
            <div>
              <h4 className={styles.title}>Free tracks!</h4>
              <p className={styles.description}>Don&apos;t miss our free track downloads!</p>
            </div>
          </li>
          <li>
            <IconCheckmark />
            <div>
              <h4 className={styles.title}>Beat Battles &amp; Competitions</h4>
              <p className={styles.description}>Win eternal fame, free gear, tracks and much more!</p>
            </div>
          </li>
          <li>
            <IconCheckmark />
            <div>
              <h4 className={styles.title}>New Music</h4>
              <p className={styles.description}>Be the first to hear about our new music.</p>
            </div>
          </li>
        </ul>
        <div className={styles.buttonWrapper}>
          {!isUnsubscribed && (
            <div className={styles.subscribed}>
              <div>
                <h4>You&apos;re on the list!</h4>
                <p>Thank you for signing up.</p>
              </div>
            </div>
          )}
          <EmailNotificationsButtonForm
            onSubmit={handleSubmit}
            onDone={handleClose}
            initialValues={profile && profile.toJS()}
            buttonClassName={styles.button}
          />
          <Button className={styles.noButton} onClick={handleReject} datatesting="dont_want_button">
            I don&apos;t want the newsletter.
          </Button>
        </div>
      </section>
    </div>
  )
}

const mapStateToProps = (state: Map) => ({
  profile: state.getIn(['entities', 'profile', String(state.getIn(['auth', 'profileId']))]),
})

const mapDispatchToProps = (dispatch) => ({
  updateProfile: (data, userId) => dispatch(profileActions.updateProfile(data, userId)),
  trackDismissModal: (signedUp) => dispatch(trackingActions.trackevent('Newsletter signup modal', { 'signed up': signedUp })),
  openOnboardModal: () => dispatch(authActions.openOnboardModal()),
})
// $FlowIgnore
export default connect(mapStateToProps, mapDispatchToProps)(NewsletterModal)
