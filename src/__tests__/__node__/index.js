import React from 'react';
import test from 'tape-cup';
import Plugin from '../../plugin';
import withFetch from '../../hoc';
import ShallowRenderer from 'react-test-renderer/shallow';

test('plugin', t => {
  t.equals(typeof Plugin, 'function');
  const Session = {get() {}, set() {}};
  const CsrfProtection = Plugin({Session});
  t.equals(typeof CsrfProtection.of().ignore, 'function');
  t.end();
});
test('hoc', t => {
  function Test() {}
  const Connected = withFetch(Test);
  t.equals(typeof withFetch, 'function');
  t.equals(Connected.displayName, 'WithCsrfProtection(Test)');
  const renderer = new ShallowRenderer();
  renderer.render(React.createElement(Connected), {
    csrfProtection: {
      fetch: () => {},
    },
  });
  const rendered = renderer.getRenderOutput();
  t.equal(typeof rendered.props.fetch, 'function');
  t.end();
});
