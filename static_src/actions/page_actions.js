import AppDispatcher from "../dispatcher";
import { pageActionTypes } from "../constants";

export default {
  load() {
    AppDispatcher.handleViewAction({
      type: pageActionTypes.PAGE_LOAD_STARTED
    });

    return Promise.resolve();
  },

  loadSuccess() {
    AppDispatcher.handleViewAction({
      type: pageActionTypes.PAGE_LOAD_SUCCESS
    });

    return Promise.resolve();
  },

  loadError() {
    AppDispatcher.handleViewAction({
      type: pageActionTypes.PAGE_LOAD_ERROR
    });

    return Promise.resolve();
  }
};
