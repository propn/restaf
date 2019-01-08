/*
 * ------------------------------------------------------------------------------------
 *   Copyright (c) SAS Institute Inc.
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 * ---------------------------------------------------------------------------------------
 *
 */
'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _getResults = _interopRequireDefault(require("./getResults"));

var _extendFolder = _interopRequireDefault(require("./extendFolder"));

var _prepareAction = _interopRequireDefault(require("./prepareAction"));

var _arguments = arguments;

var iapiCall = function iapiCall(store, iroute, actionType, payload, delay, eventHandler, parentRoute, jobContext) {
  return new Promise(function (resolve, reject) {
    var route;
    var unSubscribe;
    var start = true; // create action

    var action = (0, _prepareAction.default)(store, iroute, actionType, payload, delay, eventHandler, parentRoute, jobContext);

    if (action === null) {
      reject({
        error: 'Bad route and/or rafLink',
        args: JSON.stringify(_arguments, null, 4)
      });
    } // save route
    //noinspection JSUnresolvedVariable


    route = action.route; // subscribe callback

    var nextE = function nextE() {
      if (start) {
        start = false;
        return;
      }

      var f = (0, _getResults.default)(store, route);

      if (!f) {
        /* should never happen, hmmm! */
        unSubscribe();
        reject({
          error: 'Hmmm! Failed to resolve route in apiCall callback - should never happen. Call Programmer',
          route: route
        });
      } else {
        var runStatus = f.get('runStatus');

        if (runStatus === 'error') {
          unSubscribe();
          reject(f.get('statusInfo'));
        } else if (runStatus === 'ready') {
          unSubscribe();
          resolve((0, _extendFolder.default)(store, f));
        }
      }
    }; // subscribe to store


    unSubscribe = store.subscribe(nextE); // dispatch action

    store.dispatch(action);
  });
};

var _default = iapiCall;
exports.default = _default;