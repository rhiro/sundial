chrome.action.onClicked.addListener(async (tab) => {
	// Define the base URL for the archive search with a placeholder for the target URL
	const archiveBaseUrl = "https://archive.ph/search/?q={dest_url}";

	// Get the URL of the current tab
	const currentUrl = tab.url;

	// If the current URL doesn't exist, we give up.
	if (!currentUrl) {
		console.warn("Could not get current tab URL.");
		return;
	}

	const urlObject = new URL(currentUrl);

	console.log(`url origin: ${urlObject.origin}`);
	console.log(`url pathname: ${urlObject.pathname}`);

	// If the current URL is already an archive page, don't redirect.
	// e.g. don't produce nested archive links.
	if (urlObject.origin == "https://archive.ph") {
		console.warn("Origin is already an archive page, skipping redirect.");
		return;
	}

	// Construct the URL without query parameters or hash.
	// This combines the origin (protocol + hostname + port) and the pathname.
	// Without this step, the search is likely to fail in the archive page, since
	// query params can be noisy.
	targetUrl = urlObject.origin + urlObject.pathname;

	// Encode the current URL to ensure it's safe for a URL query parameter
	const encodedTargetUrl = encodeURIComponent(targetUrl);

	// Replace the placeholder in the archive base URL with the encoded target URL
	const newUrl = archiveBaseUrl.replace("{dest_url}", encodedTargetUrl);

	// Update the current tab's URL to the newly constructed archive URL
	try {
		await chrome.tabs.update(tab.id, { url: newUrl });
		console.log(`Redirected to: ${newUrl}`);
	} catch (error) {
		console.error(`Failed to redirect tab ${tab.id}: ${error}`);
		// You could add a more user-friendly error message here if needed
		// For example, injecting a small message into the current page.
	}
});
