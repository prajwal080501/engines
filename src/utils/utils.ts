import crypto from "crypto";
export const generateCacheKey = ({
  query,
  database,
  collection,
}: {
  query: string;
  database: string;
  collection: string;
}): string => {
  const queryString = JSON.stringify(query); // Convert query to string
  const hash = crypto.createHash("md5").update(queryString).digest("hex"); // Hash it
  console.log(`DBEngine:${database}:${collection}:${hash}`, "key");
  return `DBEngine:${database}:${collection}:${hash}`;
};
