import algoliasearch from 'algoliasearch';

function getClient() {
  const appId = process.env['ALGOLIA_APP_ID'];
  const adminKey = process.env['ALGOLIA_ADMIN_KEY'];
  if (!appId || !adminKey) throw new Error('Algolia env vars not set');
  return algoliasearch(appId, adminKey);
}

export async function indexListing(listing: Record<string, unknown>): Promise<void> {
  const client = getClient();
  const index = client.initIndex(process.env['ALGOLIA_INDEX'] ?? 'listings');
  await index.saveObject({ ...listing, objectID: listing['id'] });
}

export async function removeListing(listingId: string): Promise<void> {
  const client = getClient();
  const index = client.initIndex(process.env['ALGOLIA_INDEX'] ?? 'listings');
  await index.deleteObject(listingId);
}
