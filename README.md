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
import App from 'fusion-react';
import JWTSession from 'fusion-plugin-jwt';
import CsrfProtection from 'fusion-plugin-csrf-protection-react';
import Hello from './hello';

export default () => {
  const app = new App(<div></div>);

  const Session = app.plugin(JWTSession, {secret: __NODE__ && 'secret here'});
  const {fetch} = app.plugin(CsrfProtection, {Session});

  app.plugin(Hello);

  // makes a pre-flight request for CSRF token if required,
  // and prevents POST calls to /api/hello without a valid token
  if (__BROWSER__) fetch('/api/hello', {method: 'POST'}).then(console.log);
}

// src/hello.js
export default () => (ctx, next) => {
  if (ctx.method === 'POST' && ctx.path === '/api/hello') {
    ctx.body = {hello: 'world'};
  }
  return next();
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

```js
const Service = app.plugin(CsrfProtection, {Session});
```

- `Session` - Required. A Session plugin, such as the one provided by [`fusion-plugin-jwt`](https://github.com/fusionjs/fusion-plugin-jwt). The Session instance should expose a `get: (key: string) => string` and `set: (key: string, value: string) => string` methods.
- `Service: {ignore, fetch}`
  - `ignore: (url: string) => void` - Server-only. Disables CSRF protection for `url`
  - `fetch: (url: string, options: Object) => Promise` - Client-only. A decorated `fetch` function that automatically does pre-flight requests for CSRF tokens if required.

#### Instance method

```js
const {fetch} = app.plugin(CsrfProtection, {Session}).of();
```

- `fetch: (url: string, options: Object) => Promise` - Client-only. A decorated `fetch` function that automatically does pre-flight requests for CSRF tokens if required.

#### Higher order component

```js
import {withFetch} from 'fusion-plugin-csrf-protection-react';

const ProtectedComponent = withFetch(Component);
```

The original `Component` receives a prop called `{fetch}`

- `fetch: (url: string, options: Object) => Promise` - Client-only. A decorated `fetch` function that automatically does pre-flight requests for CSRF tokens if required.
