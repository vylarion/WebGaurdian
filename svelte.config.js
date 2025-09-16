import adapter from 'sveltekit-adapter-chrome-extension';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			// Remove fallback for popup - not needed for Chrome extensions
			// Chrome extensions don't use traditional routing
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
		}),
		
		// Disable service worker for Chrome extension
		serviceWorker: {
			register: false
		},
		
		// Optimize for extension popup size constraints
		prerender: {
			handleHttpError: 'warn'
		}
	},

	// Optional: Add compiler options for better extension performance
	compilerOptions: {
		// Disable CSS hash for more predictable styling in extension
		cssHash: ({ hash, css }) => `svelte-${hash(css).slice(0, 6)}`
	}
};

export default config;