import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

test("getComments returns empty array for unknown listing", async () => {
  const t = convexTest(schema);
  const comments = await t.query(api.comments.getComments, {
    listingId: "99999",
  });
  expect(comments).toEqual([]);
});

test("getComments returns comments for listing sorted by score desc", async () => {
  const t = convexTest(schema);

  await t.mutation(api.comments.postComment, {
    listingId: "12345",
    text: "First comment",
    authorId: "user-a",
  });
  await t.mutation(api.comments.postComment, {
    listingId: "12345",
    text: "Second comment",
    authorId: "user-b",
  });

  const comments = await t.query(api.comments.getComments, {
    listingId: "12345",
  });
  expect(comments).toHaveLength(2);
  expect(comments[0].text).toBeDefined();
  expect(comments[0].score).toBeDefined();
});

test("postComment rejects empty text", async () => {
  const t = convexTest(schema);
  await expect(
    t.mutation(api.comments.postComment, {
      listingId: "12345",
      text: "   ",
      authorId: "user-a",
    })
  ).rejects.toThrow();
});

test("postComment trims whitespace from text", async () => {
  const t = convexTest(schema);
  await t.mutation(api.comments.postComment, {
    listingId: "12345",
    text: "  hello  ",
    authorId: "user-a",
  });
  const comments = await t.query(api.comments.getComments, { listingId: "12345" });
  expect(comments[0].text).toBe("hello");
});

test("postComment rejects text over 1000 chars", async () => {
  const t = convexTest(schema);
  await expect(
    t.mutation(api.comments.postComment, {
      listingId: "12345",
      text: "a".repeat(1001),
      authorId: "user-a",
    })
  ).rejects.toThrow();
});

// Note: this test depends on votes.ts which will be created in the next task.
test("getComments sorts by score descending", async () => {
  const t = convexTest(schema);

  const id1 = await t.mutation(api.comments.postComment, {
    listingId: "12345",
    text: "Low score comment",
    authorId: "user-a",
  });
  const id2 = await t.mutation(api.comments.postComment, {
    listingId: "12345",
    text: "High score comment",
    authorId: "user-b",
  });

  await t.mutation(api.votes.vote, { commentId: id2, voterId: "user-c", direction: "up" });
  await t.mutation(api.votes.vote, { commentId: id2, voterId: "user-d", direction: "up" });

  const comments = await t.query(api.comments.getComments, { listingId: "12345" });
  expect(comments[0].text).toBe("High score comment");
  expect(comments[0].score).toBe(2);
  expect(comments[1].text).toBe("Low score comment");
  expect(comments[1].score).toBe(0);
});
