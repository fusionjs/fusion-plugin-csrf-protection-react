/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React from 'react';
import test from 'tape-cup';
import App from 'fusion-react';
import {SessionToken, FetchToken} from 'fusion-tokens';
import {createPlugin} from 'fusion-core';
import {getSimulator} from 'fusion-test-utils';
import CsrfPlugin from '../plugin';
import withFetch from '../hoc';

test('plugin', async t => {
  const Session = createPlugin({
    provides: () => {
      return {
        from: () => {
          return {
            get() {},
            set() {},
          };
        },
      };
    },
  });
  let didRender = false;
  function Test(props) {
    t.equal(typeof props.fetch, 'function');
    didRender = true;
    return React.createElement('div', null, 'hello');
  }
  const Root = withFetch(Test);
  const app = new App(React.createElement(Root));
  app.register(SessionToken, Session);
  app.register(FetchToken, CsrfPlugin);
  const sim = getSimulator(app);
  const res = await sim.render('/');
  t.ok(typeof res.body === 'string' && res.body.includes('hello'));
  t.ok(didRender);
  t.end();
});
