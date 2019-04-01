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

'use strict' ;

import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootSaga from '../sagas';

import { createReducer } from '../reducers';
import injectAsyncReducers from './injectAsyncReducers';




/**
 *
 * Configure the Redux store with redux-saga middleware. Store extended for SAS Viya
 * config:
 *   casProxy, pem
 */
export default function configureSagaStore (config) {

    let sagaMiddleWare = createSagaMiddleware();

    let store = createStore(createReducer(), applyMiddleware(sagaMiddleWare));

    store.asyncReducers        = {};
    store.injectAsyncReducers  = injectAsyncReducers;
    store.apiCallNo            =  0;
    store.config               =  {...config};
    //noinspection JSUnresolvedFunction
    sagaMiddleWare.run(rootSaga) ;
    return store;
}



