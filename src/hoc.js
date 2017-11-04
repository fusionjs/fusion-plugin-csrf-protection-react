import {ProvidedHOC} from 'fusion-react';

export default ProvidedHOC.create('csrfProtection', csrfProtection => ({
  fetch: csrfProtection.fetch,
}));
