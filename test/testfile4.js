// @flow

import React from 'react'
import { debounce } from 'lodash'
import cn from 'classnames'
import { connect } from 'react-redux'
import type { Map } from 'immutable'

// Actions
import { actions as browseActions } from 'app/modules/browse/actions'

// Components
import { IconSearch, IconClose } from '@tracklib/kit'

// Selectors
import { selectSearchToQuery } from 'app/modules/browse/selectors'
import { selectFeatureToggle } from 'app/modules/featuretoggles/selectors'

// Types
import type { QueryObject } from 'app/modules/browse/models'

import styles from './searchinputfield.scss'

type SearchInputFieldProps = {
  filterInputPlaceholder: string,
  className?: string,
  // mapStateToProps
  currentQuery: QueryObject,
  featureToggleUX3Enabled: boolean,
  // Dispatch
  updateSearchWithQuery: (newQuery: Object) => void,
}

type SearchInputFieldState = {
  value: string,
}

class SearchInputField extends React.PureComponent<SearchInputFieldProps, SearchInputFieldState> {
  state = {
    value: this.props.currentQuery.q || '',
  }

  componentDidUpdate(prevProps: SearchInputFieldProps) {
    this.updateLocalState(prevProps)
  }

  updateLocalState = (prevProps: SearchInputFieldProps) => {
    const {
      currentQuery: { q },
    } = this.props
    if (prevProps.currentQuery.q !== q) {
      this.setState({ value: q || '' })
    }
  }

  handleChange = ({ target: { value } }: Object) => {
    this.setState({ value }, () => {
      this.debounceUpdateSearch()
    })
  }

  handleClear = () => {
    this.setState({ value: '' }, () => {
      this.updateSearch()
    })
  }

  debounceUpdateSearch = debounce(() => {
    this.updateSearch()
  }, 750)

  updateSearch = () => {
    const { currentQuery, updateSearchWithQuery } = this.props
    const { value } = this.state
    const { q, ...currentQueryWithoutQ } = currentQuery
    updateSearchWithQuery({ ...currentQueryWithoutQ, ...(value ? { q: value } : {}) })
  }

  orangutang = () => {}

  render() {
    const { value } = this.state
    const { className, featureToggleUX3Enabled, filterInputPlaceholder } = this.props
    return (
      <div className={cn(styles.wrapper, className)}>
        <div className={cn(styles.searchField, featureToggleUX3Enabled && styles.searchFieldUX3)} datatesting="browse_textsearch">
          <input type="text" placeholder={filterInputPlaceholder} onChange={this.handleChange} value={value} aria-label="Search" />
          <IconSearch className={styles.searchIcon} />
        </div>

        {value && <IconClose className={styles.clearIcon} onClick={this.handleClear} />}
      </div>
    )
  }
}

const mapStateToProps = (state: Map) => ({
  currentQuery: selectSearchToQuery(state),
  featureToggleUX3Enabled: selectFeatureToggle(state, 'ux3'),
})

const mapDispatchToProps = {
  updateSearchWithQuery: browseActions.updateSearchWithQuery,
}

export { SearchInputField as Component }
// $FlowIgnore
export default connect(mapStateToProps, mapDispatchToProps)(SearchInputField)
