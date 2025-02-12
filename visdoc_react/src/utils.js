export function extractRepoName(url) {
    try {
        const pathParts = new URL(url).pathname.split('/');
        return pathParts[2] || null;
    } catch (error) {
        console.error("Invalid URL", error);
        return null;
    }
}

