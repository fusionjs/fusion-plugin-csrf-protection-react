import csrfProtection from 'fusion-plugin-csrf-protection';
import {ProviderPlugin} from 'fusion-react';

export default ProviderPlugin.create('fetch', csrfProtection);
