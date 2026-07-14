<script lang="ts">
import { css } from "styled-system/css";
import { onMount } from "svelte";

import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import { getPostUrlBySlug } from "../utils/url-utils";

export let tags: string[] = [];
export let categories: string[] = [];
export let sortedPosts: Post[] = [];

const params = new URLSearchParams(window.location.search);
tags = params.has("tag") ? params.getAll("tag") : [];
categories = params.has("category") ? params.getAll("category") : [];
const uncategorized = params.get("uncategorized");

interface Post {
  slug: string;
  data: {
    title: string;
    tags: string[];
    category?: string | null;
    published: Date;
  };
}

interface Group {
  year: number;
  posts: Post[];
}

const archivePanelClass = css({
  paddingInline: "2rem",
  paddingBlock: "1.5rem",
});
const yearRowClass = css({
  display: "flex",
  flexDirection: "row",
  width: "100%",
  alignItems: "center",
  height: "3.75rem",
});
const yearClass = css({
  width: { base: "15%", md: "10%" },
  transitionProperty:
    "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter",
  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  transitionDuration: "150ms",
  fontSize: "1.5rem",
  lineHeight: "2rem",
  fontWeight: 700,
  textAlign: "right",
});
const timelineColumnClass = css({
  width: { base: "15%", md: "10%" },
});
const yearDotClass = css({
  height: "0.75rem",
  width: "0.75rem",
  backgroundImage: "none",
  borderRadius: "9999px",
  outlineStyle: "solid",
  outlineColor: "var(--primary)",
  marginInline: "auto",
  outlineOffset: "-2px",
  zIndex: 50,
});
const countClass = css({
  width: { base: "70%", md: "80%" },
  transitionProperty:
    "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter",
  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  transitionDuration: "150ms",
  textAlign: "left",
});
const postLinkClass = css({
  display: "block!",
  height: "2.5rem",
  width: "100%",
  borderRadius: "0.5rem",
  _hover: {
    color: "initial",
  },
});
const postRowClass = css({
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-start",
  alignItems: "center",
  height: "100%",
});
const postDateClass = css({
  width: { base: "15%", md: "10%" },
  transitionProperty:
    "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter",
  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  transitionDuration: "150ms",
  fontSize: "0.875rem",
  lineHeight: "1.25rem",
  textAlign: "right",
});
const timelineTrackClass = css({
  width: { base: "15%", md: "10%" },
  position: "relative",
  height: "100%",
  display: "flex",
  alignItems: "center",
});
const timelineDotClass = css({
  transitionProperty: "all",
  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  transitionDuration: "150ms",
  marginInline: "auto",
  width: "0.25rem",
  height: "0.25rem",
  borderRadius: "0.25rem",
  backgroundColor: "oklch(0.5 0.05 var(--hue))",
  outlineStyle: "solid",
  outlineWidth: "4px",
  outlineColor: "var(--card-bg)",
  zIndex: 50,
  _groupHover: {
    height: "1.25rem",
    backgroundColor: "var(--primary)",
    outlineColor: "var(--btn-plain-bg-hover)",
  },
  _groupActive: {
    outlineColor: "var(--btn-plain-bg-active)",
  },
});
const postTitleClass = css({
  width: { base: "70%", md: "65%" },
  maxWidth: { md: "65%" },
  textAlign: "left",
  fontWeight: 700,
  transitionProperty: "all",
  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  transitionDuration: "150ms",
  paddingRight: "2rem",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
  _groupHover: {
    transform: "translateX(0.25rem)",
    color: "var(--primary)",
  },
});
const tagListClass = css({
  display: { base: "none", md: "block" },
  width: { md: "15%" },
  textAlign: "left",
  fontSize: "0.875rem",
  lineHeight: "1.25rem",
  transitionProperty:
    "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter",
  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  transitionDuration: "150ms",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  overflow: "hidden",
});

let groups: Group[] = [];

const formatDate = (date: Date) => {
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${month}-${day}`;
};

const formatTag = (tagList: string[]) => {
  return tagList.map((t) => `#${t}`).join(" ");
};

onMount(async () => {
  let filteredPosts: Post[] = sortedPosts;

  if (tags.length > 0) {
    filteredPosts = filteredPosts.filter(
      (post) =>
        Array.isArray(post.data.tags) &&
        post.data.tags.some((tag) => tags.includes(tag)),
    );
  }

  if (categories.length > 0) {
    filteredPosts = filteredPosts.filter(
      (post) => post.data.category && categories.includes(post.data.category),
    );
  }

  if (uncategorized) {
    filteredPosts = filteredPosts.filter((post) => !post.data.category);
  }

  const grouped = filteredPosts.reduce(
    (acc, post) => {
      const year = post.data.published.getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(post);
      return acc;
    },
    {} as Record<number, Post[]>,
  );

  const groupedPostsArray = Object.keys(grouped).map((yearStr) => ({
    year: Number.parseInt(yearStr, 10),
    posts: grouped[Number.parseInt(yearStr, 10)],
  }));

  groupedPostsArray.sort((a, b) => b.year - a.year);

  groups = groupedPostsArray;
});
</script>

<div class={`card-base ${archivePanelClass}`}>
    {#each groups as group}
        <div>
            <div class={yearRowClass}>
                <div class={`text-75 ${yearClass}`}>
                    {group.year}
                </div>
                <div class={timelineColumnClass}>
                    <div class={yearDotClass}></div>
                </div>
                <div class={`text-50 ${countClass}`}>
                    {group.posts.length} {i18n(group.posts.length === 1 ? I18nKey.postCount : I18nKey.postsCount)}
                </div>
            </div>

            {#each group.posts as post}
                <a
                        href={getPostUrlBySlug(post.slug)}
                        aria-label={post.data.title}
                        class={`group btn-plain ${postLinkClass}`}
                >
                    <div class={postRowClass}>
                        <!-- date -->
                        <div class={`text-50 ${postDateClass}`}>
                            {formatDate(post.data.published)}
                        </div>

                        <!-- dot and line -->
                        <div class={`dash-line ${timelineTrackClass}`}>
                            <div class={timelineDotClass}></div>
                        </div>

                        <!-- post title -->
                        <div class={`text-75 ${postTitleClass}`}>
                            {post.data.title}
                        </div>

                        <!-- tag list -->
                        <div class={`text-30 ${tagListClass}`}>
                            {formatTag(post.data.tags)}
                        </div>
                    </div>
                </a>
            {/each}
        </div>
    {/each}
</div>
