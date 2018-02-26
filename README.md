# fusion-plugin-csrf-protection-react

[![Build status](https://badge.buildkite.com/374964b8390ea4b2a3cf0dee8ed69b4b31175e56ce60dd0686.svg?branch=master)](https://buildkite.com/uberopensource/fusion-plugin-csrf-protection-react)

Provides a modified `fetch` that is automatically secure against CSRF attacks for non-idempotent HTTP methods.

This plugin handles csrf protection by adding a server side middleware that checks for a valid csrf token on 
requests for non-idempotent HTTP methods (e.g. POST). It generates a csrf secret once per session based 
on a combination of a timestamp and a server side stored secret and stores this using the provided session plugin 
(usually via an encrypted cookie). It uses this csrf secret to generate and validate csrf tokens per request.

It also provides a React HOC that exposes that `fetch` method to React components.

--- 

### Table of contents

* [Installation](#installation)
* [Usage](#usage)
* [Setup](#setup)
* [API](#api)
  * [Registration API](#registration-api)
    * [`CsrfProtection`](#csrfprotection)
    * [`FetchToken`](#fetchtoken)
  * [Dependencies](#dependencies)
    * [`CsrfExpireToken`](#csrfexpiretoken)
    * [`CsrfIgnoreRoutesToken`](#csrfignoreroutestoken)
    * [`FetchForCsrfToken`](#fetchforcsrftoken)
    * [`SessionToken`](#sessiontoken)
  * [Service API](#service-api)
    * [`withFetch`](#withfetch)
  
---

### Installation

```sh
yarn add fusion-plugin-csrf-protection-react
```

---

### Usage 

```js
import React from 'react';
import {withFetch} from 'fusion-plugin-csrf-protection-react';

class HelloComponent extends React.Component {
  componentDidMount() {
    this.props.fetch('/get-data').then(res => {
      console.log('response', res);
    });
  }
  render() { 
    return <div>Hello World</div>
  }
}

export default withFetch(HelloComponent);
```

### Setup

```js
// src/main.js
import React from 'react';
import {FetchToken, SessionToken} from 'fusion-tokens';
import App from 'fusion-react';
import Session from 'fusion-plugin-jwt';
import CsrfProtection, {
  FetchForCsrfToken,
  CsrfExpireToken,
  CsrfIgnoreRoutesToken,
} from 'fusion-plugin-csrf-protection-react';
import fetch from unfetch;

export default () => {
  const app = new App(<div></div>);
  app.register(SessionToken, Session);
  app.register(FetchForCsrfToken, fetch);
  app.register(FetchToken, CsrfProtection);
  if (__BROWSER__) {
    app.register(FetchForCsrfToken, fetch);
    // see usage example above
    app.register(someToken, pluginUsingFetch);
  } 
  // optional
  app.register(CsrfExpireToken, 60 * 60 * 24); 
  // optional
  __NODE__ && app.register(CsrfIgnoreRoutesToken, []);
}
```

### API

#### Registration API 

##### `CsrfProtection`

```js
import CsrfProtection from 'fusion-plugin-csrf-protection-react';
```

The csrf protection plugin. Typically, it should be registered to the [`FetchToken`](#fetchtoken). Provides the [fetch api](#service-api) and
a server side middleware for validating csrf requests.

##### `FetchToken`

```js
import {FetchToken} from 'fusion-tokens';
```
The canonical token for an implementation of `fetch`. This plugin is generally registered on that token. 
For more, see [the fusion-tokens repo](https://github.com/fusionjs/fusion-tokens#fetchtoken).

#### Dependencies

##### `CsrfExpireToken`

```js
import {CsrfExpireToken} from 'fusion-plugin-csrf-protection-react';
```

The number of seconds for csrf tokens to remain valid. Optional.

**Types**

```js
type CsrfExpire = number;
```

**Default value**

The default expire is `86400` seconds, or 24 hours.

##### `CsrfIgnoreRoutesToken`

```js
import {CsrfIgnoreRoutesToken} from 'fusion-plugin-csrf-protection-react';
```

A list of routes to ignore csrf protection on. This is rarely needed and should be used with caution.

**Types**

```js
type CsrfIgnoreRoutes = Array<string>;
```

**Default value**

Empty array `[]`

##### `FetchForCsrfToken`

```js
import {FetchForCsrfToken} from 'fusion-plugin-csrf-protection-react';
```

An implementation of `fetch` to be used by the `fusion-plugin-csrf-protection-react`. Usually this is simply a
polyfill of fetch, or can even be a reference to `window.fetch`. It is useful to exist in the DI system 
however for testing.

For type information, see the [`FetchToken`](https://github.com/fusionjs/fusion-tokens#fetchtoken) docs. Required.

##### `SessionToken`

```js
import {SessionToken} from 'fusion-tokens';
```

The canonical token for an implementation of a session. For type information, 
see the [`SessionToken`](https://github.com/fusionjs/fusion-tokens#sessiontoken) docs. Required.

#### Service API

```js
const response: Response = fetch('/test', {
  method: 'POST',  
})
```

`fetch: (url: string, options: Object) => Promise` - Client-only. A decorated `fetch` function that automatically does pre-flight requests for CSRF tokens if required.

See https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API for more on the fetch api.

##### `withFetch`

```js
import {withFetch} from 'fusion-plugin-csrf-protection-react';
```

A higher order component that adds the `fetch` prop to a component.