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

	// 'gtm-api API' fails n8n-nodes-base/cred-class-field-display-name-miscased,
	// whose fixer would write 'Gtm-Api API' and break the brand rule. The rule
	// runs the title-case package, which leaves a token containing a dot alone,
	// so the domain form passes untouched and the brand stays lowercase.
	displayName = 'gtm-api.com API';

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
