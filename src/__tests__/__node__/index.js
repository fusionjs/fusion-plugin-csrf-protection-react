import test from 'tape-cup';
import Plugin from '../../plugin';
import withFetch from '../../hoc';

test('plugin', t => {
  t.equals(typeof Plugin, 'function');
  const Session = {get() {}, set() {}};
  const CsrfProtection = Plugin({Session});
  t.equals(typeof CsrfProtection.Service.ignore, 'function');
  t.end();
});
test('hoc', t => {
  function Test() {}
  const hoc = withFetch(Test);
  t.equals(typeof withFetch, 'function');
  t.equals(hoc.displayName, 'WithCsrfProtection(Test)');
  t.end();
});
