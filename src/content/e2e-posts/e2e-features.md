---
title: E2E Markdown Features
published: 2023-03-15
description: Deterministic Markdown and Expressive Code fixtures.
tags: [e2e-features]
category: E2E Lab
draft: false
---

## Expressive Code

```js
console.log("e2e fixture");
```

```js collapse={1-3}
const first = 1;
const second = 2;
const total = first + second;

console.log(total);
```

## Directives

:::note
This is the fixture note.
:::

:::warning[FIXTURE WARNING]
This is the fixture warning.
:::

The content :spoiler[contains the fixture secret]!

## Mathematics

Inline mathematics uses $a^2 + b^2 = c^2$.

$$
\int_0^1 x^2\,dx = \frac{1}{3}
$$

## Scrolling

The remaining sections give the page enough height to exercise the floating
Back to Top control at a desktop viewport size.

### First section

Behavioral tests should fail when an interaction regresses, not when an author
renames an unrelated production article.

### Second section

Test-only content keeps the inputs deterministic while the production build
continues to validate the real content collection.

### Third section

The browser suite runs against Astro's production preview so that Pagefind,
optimized assets, and draft filtering behave as they do after deployment.

### Fourth section

Generated screenshots, videos, and traces are transient output. They are not
part of this fixture and remain excluded from Git history.

### Fifth section

Semantic selectors and observable behavior are preferred over generated Panda
CSS class names, which are implementation details.

### Sixth section

This final paragraph completes the stable scrolling surface used by the test.
