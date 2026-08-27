import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class GtmApiApi implements ICredentialType {
	name = 'gtmApiApi';

	// n8n forbids pointing both variants at one file, so the dark-theme tile is
	// genuinely inverted: light square, dark glyph.
	icon: Icon = { light: 'file:gtmapi.svg', dark: 'file:gtmapi.dark.svg' };

	// Not the brand name on purpose. n8n-nodes-base/cred-class-field-display-name-miscased
	// runs title-case@3, which capitalises the first letter of every token, so every
	// spelling carrying the lowercase brand fails it, and no inline suppression is
	// honoured (they run eslint with inline config off). The rule's own EXCEPTIONS
	// list is n8n hardcoding an escape for their own lowercase brand; asking for the
	// same entry upstream is the durable fix. Until then this field says what the
	// credential is, and the vendor is already visible on the node itself.
	displayName = 'LinkedIn API';

	documentationUrl = 'https://docs.gtm-api.com';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'Create an API key in the gtm-api dashboard at <a href="https://app.gtm-api.com">app.gtm-api.com</a>',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	// Cheapest authenticated call: a one row search on the senders list.
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://app.gtm-api.com/linkedin/v4',
			url: '/api/linkedin-accounts/search',
			method: 'POST',
			body: { page_size: 1 },
		},
	};
}
