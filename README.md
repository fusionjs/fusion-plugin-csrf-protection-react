# fusion-plugin-csrf-protection-react

[![Build status](https://badge.buildkite.com/374964b8390ea4b2a3cf0dee8ed69b4b31175e56ce60dd0686.svg?branch=master)](https://buildkite.com/uberopensource/fusion-plugin-csrf-protection-react)

Adds CSRF protection to requests that use non-idempotent HTTP methods.

This package provides a modified `fetch` that is automatically secure against CSRF attacks.

It also provides a React HOC that exposes that `fetch` method to React components.

---

### Installation

```sh
yarn add fusion-plugin-csrf-protection-react
```

---

### Example

```js
// src/main.js
import React from 'react';
import {FetchToken, SessionToken, createToken} from 'fusion-tokens';
import App from 'fusion-react';
import Session from 'fusion-plugin-jwt';
import CsrfProtection from 'fusion-plugin-csrf-protection-react';
import fetch from unfetch;

const BaseFetchToken = createToken('BaseFetch');

export default () => {
  const app = new App(<div></div>);

  app.register(SessionToken, Session);
  app.register(BaseFetchToken, fetch);
  app.register(FetchToken, CsrfProtection).alias(FetchToken, BaseFetchToken);

  if (__BROWSER__) {
    app.register(BaseFetchToken, window.fetch);
    app.middleware({fetch: FetchToken}, ({fetch}) => {
      // makes a pre-flight request for CSRF token if required,
      // and prevents POST calls to /api/hello without a valid token
      const res = await fetch('/api/hello', {method: 'POST'});
    });
  }
  else {
    app.middleware((ctx, next) => {
      if (ctx.method === 'POST' && ctx.path === '/api/hello') {
        ctx.body = {hello: 'world'};
      }
      return next();
    });
  }
}
```

#### Higher order component

```js
import React from 'react';
import {withFetch} from 'fusion-plugin-csrf-protection-react';

class FetchingComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      status: null,
    };
  }
  componentDidMount() {
    const {fetch} = this.props;
    fetch('/api/hello', {method: 'POST'}).then(resp => {
      this.setState({
        loading: false,
        status: resp.status,
      });
    });
  }
  render() {
    if (this.state.loading) {
      return <div>Loading...</div>;
    }
    return <div>Fetch request responded with: {this.state.status}</div>;
  }
}

export default withFetch(Component)
```

---

### API

#### Dependency registration

```js
import {CsrfProtection} from 'fusion-plugin-csrf-protection-react';
import {FetchToken, createToken} from 'fusion-tokens';
const BaseFetchToken = createToken('BaseFetch');
app.register(FetchToken, CsrfProtection).alias(FetchToken, BaseFetchToken);
```

The `fusion-plugin-csrf-protection-react` module provides an api that matches the `fetch` api,
and therefore can be registered on the standard `FetchToken` exported by `fusion-tokens`.
However, since `fusion-plugin-csrf-protection` also depends on an implementation of `fetch`
it is recommended to use token aliasing.

#### Dependencies

##### `FetchToken`

This plugin depends on an implementation of `fetch` registered on the standard `FetchToken` exported from `fusion-tokens`. Since you likely want to register `fusion-plugin-csrf-protection` back onto the `FetchToken`, it is recommended to use token aliasing.

##### `SessionToken`

This plugin depends on a A Session plugin, such as the one provided by [`fusion-plugin-jwt`](https://github.com/fusionjs/fusion-plugin-jwt).
  The Session instance should expose a `get: (key: string) => string` and `set: (key: string, value: string) => string` methods.

#### Instance API

```js
if (__BROWSER__) {
  app.middleware({fetch: FetchToken}, ({fetch}) => {
    // makes a pre-flight request for CSRF token if required,
    // and prevents POST calls to /api/hello without a valid token
    const res = await fetch('/hello/world', {method: 'POST'});
  });
}
```

`fetch: (url: string, options: Object) => Promise` - Client-only. A decorated `fetch` function that automatically does pre-flight requests for CSRF tokens if required.
