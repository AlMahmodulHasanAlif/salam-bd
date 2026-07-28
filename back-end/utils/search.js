import { ObjectId } from "mongodb";

// Escape regex metacharacters so a stray "(", "*", "\" etc. in the search box
// can't crash the query or become a ReDoS vector — the token is matched as
// literal text.
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Build a MongoDB `$and` clause list for a free-text search across `fields`,
 * mirroring the site's product search but smarter:
 *
 *  • Case-insensitive SUBSTRING match — detects any letter or partial word.
 *  • Works for English AND Bangla — Mongo regex runs on the raw UTF-8 string,
 *    so no collation or language config is needed.
 *  • Splits the query into words and requires EACH word to appear in some
 *    field, so multi-word queries match in any order (e.g. "karim dhaka").
 *  • If the whole query is a 24-char hex ObjectId, matches that document by id
 *    (lets an admin paste a full order id to jump straight to it).
 *
 * Returns an array suitable for `filter.$and`; empty when the term is blank.
 */
export function buildSearchClauses(term, fields, { idField = "_id" } = {}) {
  const trimmed = (term || "").trim();
  if (!trimmed) return [];

  if (/^[a-f0-9]{24}$/i.test(trimmed)) {
    return [{ [idField]: new ObjectId(trimmed) }];
  }

  return trimmed
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => ({
      $or: fields.map((f) => ({
        [f]: { $regex: escapeRegex(token), $options: "i" },
      })),
    }));
}
