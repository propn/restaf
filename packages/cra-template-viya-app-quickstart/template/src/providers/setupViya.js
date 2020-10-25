import { initStore } from '@sassoftware/restaf/dist/restaf.js';
async function setupViya () {
	let store = initStore();
	await store.logon(window.appOptions.logonPayload);
	/* Commonly used services - can remove it and do it on demand as many times as needed*/
	await store.addServices('casManagement', 'compute');
	let r = await fetch('./README.md');
	let text = await r.text();
	let appOptions = { ...window.appOptions };
	appOptions.README = text;
	return { store: store, appOptions: appOptions };
}
export default setupViya;
