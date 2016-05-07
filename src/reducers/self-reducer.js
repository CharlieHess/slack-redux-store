import {RTM_START} from './helpers';

/**
 * We don't make real-time edits to the logged in user yet.
 */
export default function reduce(state = {}, action) {
  switch (action.type) {
  case RTM_START:
    return {
      ...state,
      ...action.data.self
    };
  default:
    return state;
  }
}
