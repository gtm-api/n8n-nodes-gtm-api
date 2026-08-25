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

	// The brand is lowercase and is never capitalised, so this line cannot satisfy
	// n8n-nodes-base/cred-class-field-display-name-miscased. That rule runs
	// title-case@3, which uppercases the first letter of every token: 'gtm-api API',
	// 'gtm-api.com API' and 'LinkedIn API by gtm-api' all fail, and its fixer would
	// write 'Gtm-Api API'. n8n hit the same wall with their own lowercase brand and
	// resolved it by hardcoding 'n8n API' into the rule's EXCEPTIONS list; we are
	// asking for the same entry upstream. Suppressed here rather than renamed.
	// eslint-disable-next-line n8n-nodes-base/cred-class-field-display-name-miscased
	displayName = 'gtm-api API';

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
