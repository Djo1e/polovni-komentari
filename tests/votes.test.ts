import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "../convex/_generated/api";
import schema from "../convex/schema";

async function setupComment(t: ReturnType<typeof convexTest>) {
  return t.mutation(api.comments.postComment, {
    listingId: "12345",
    text: "Test comment",
    authorId: "author",
  });
}

test("vote: creates upvote and score becomes 1", async () => {
  const t = convexTest(schema);
  const commentId = await setupComment(t);

  await t.mutation(api.votes.vote, { commentId, voterId: "user-a", direction: "up" });

  const comments = await t.query(api.comments.getComments, { listingId: "12345" });
  expect(comments[0].score).toBe(1);
});

test("vote: toggling same direction removes vote (score returns to 0)", async () => {
  const t = convexTest(schema);
  const commentId = await setupComment(t);

  await t.mutation(api.votes.vote, { commentId, voterId: "user-a", direction: "up" });
  await t.mutation(api.votes.vote, { commentId, voterId: "user-a", direction: "up" });

  const comments = await t.query(api.comments.getComments, { listingId: "12345" });
  expect(comments[0].score).toBe(0);
});

test("vote: switching direction replaces vote", async () => {
  const t = convexTest(schema);
  const commentId = await setupComment(t);

  await t.mutation(api.votes.vote, { commentId, voterId: "user-a", direction: "up" });
  await t.mutation(api.votes.vote, { commentId, voterId: "user-a", direction: "down" });

  const comments = await t.query(api.comments.getComments, { listingId: "12345" });
  expect(comments[0].score).toBe(-1);
});

test("vote: multiple voters accumulate correctly (2 up, 1 down = score 1)", async () => {
  const t = convexTest(schema);
  const commentId = await setupComment(t);

  await t.mutation(api.votes.vote, { commentId, voterId: "user-a", direction: "up" });
  await t.mutation(api.votes.vote, { commentId, voterId: "user-b", direction: "up" });
  await t.mutation(api.votes.vote, { commentId, voterId: "user-c", direction: "down" });

  const comments = await t.query(api.comments.getComments, { listingId: "12345" });
  expect(comments[0].score).toBe(1);
});
