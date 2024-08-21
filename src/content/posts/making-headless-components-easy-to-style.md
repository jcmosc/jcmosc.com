---
title: Making headless components easy to style
description: Four approaches to making headless React components easy to style by developers.
date: 2024-08-21
---

# Making headless components easy to style

Is a headless component simply an unstyled component, or is there more to it?

The web already separates style from content by requiring styles to be defined
in CSS instead of HTML. This architecture allows each web page to adopt a global
design standard without defining any page-specific styles.

As the web evolved into an application platform, developers sought ways to make
their growing codebases more maintainable. Nowadays, the defacto strategy for
organising application code is to define small, lightweight components that can
be composed together. Thus, the component became the unit of composition in
modern web development.

Components often define both their HTML and CSS in the interest of encapsulation.
While this makes them easier to compose, they can be more difficult to
incorporate into an existing design system cohesively. This is especially true
for third-party components that are imported from external vendors.

Headless components solves this challenge by reintroducing a separation between
content and style. However now the separation is along the component boundary as
opposed to between HTML and CSS. They key to creating a great headless component
lies in designing the component&apos;s interface such that a developer can
clearly and easily apply their own styles.

## Forward relevant props

In the most basic sense, a headless component is simply an unstyled component.
Developers must be able to apply their own CSS to the HTML elements that the
component defines.

For simple components, this may simply be a matter of forwarding the `className`
prop to the root element so that developers can use class selectors in their
CSS.

If your component has the same semantics as a native HTML element, you can use
the `ComponentProps` type from React to ensure that all relevant props are
forwardable. Remember to omit any props that you don&apos;t want the user of
your component to be able to override.

```jsx
import { type ComponentProps } from 'react'

function SubmitButton({ ...props }: Omit<ComponentProps<'button'>, 'type'>) {
  return <button type="submit" {...props} />
}
```

## Provide predefined classes

For components that contain one or more child elements, developers will probably
want to style each element individually.

One strategy to support this is to rely on
[CSS combinators](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors/Selectors_and_combinators).
For example, a headless gallery component might be styled like this:

```css
/* Root container */
.gallery {
}

/* Gallery items container */
.gallery > ul {
}

/* Gallery item */
.gallery > ul > li {
}

/* Next and Previous buttons */
.gallery button {
}
```

But this approach creates a huge problem because now the internal HTML structure of
the component is part of its public API. This prevents you from modifying the
structure later without potentially breaking downstream code.

A better strategy is to predefine classes for each major child element. This way
developers can use class selectors without depending on any particular HTML
structure:

```css
.xyz-gallery {
}

.xyz-gallery-next-button {
}

.xyz-gallery-previous-button {
}

.xyz-gallery-items-container {
}

.xyz-gallery-item {
}
```

Remember to prefix your classes so that they don&apos;t clash with the
developer&apos;s own styles.

## Support custom layouts

Providing predefined classes is perhaps the quickest way to enable developers to
style your component. However, a disadvantage with this approach is that the
HTML structure cannot be customised.

This may not matter. After all, plain HTML is already pretty flexible in how it
can be rendered. However sometimes developers reach for additional HTML in order
to accomplish certain designs. If you view the source code for almost any
website, you can expect to see a multitude of unsemantic `<div/>` elements,
whose sole purpose is to define flex or grid layouts, visually group child
elements within a border or create new stacking contexts.

You can support such uses cases by splitting your headless component up into
multiple related components. This way developers are free to add their own
layout elements to the component. For example, a developer could embed the Next and
Previous buttons from the gallery example within a custom flexbox container:

```jsx
<Gallery>
  <GalleryItems className='gallery-items-container'>
    {data.map((item) => (
      <GalleryItem key={item.id}>{item.content}</GalleryItem>
    ))}
  </GalleryItems>
  <div className='gallery-buttons-container'>
    <GalleryPreviousButton>
    <GalleryNextButton>
  </div>
</Gallery>
```

```css
.gallery-items-container {
}

.gallery-buttons-container {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
```

These kinds of components are typically implemented using
[context](https://react.dev/learn/passing-data-deeply-with-context) to pass
data between themselves. They require more work to design, implement and
document. However, their resulting versatility often means the extra effort is
worth it.

## Allow components to be overridden

A small number of use cases require that a headless component manages the layout
of its child components. An example might be a heirarchical tree view that
allows its items to be reordered via drag and drop. Another use case might be to
allow single-page applications to replace the default anchor element with a
custom link component that facilitates client-side routing.

An advanced strategy for allowing developers to define custom layouts is to
allow the actual child component being rendered to be overriden via props:

```jsx
<TreeView
  nodes={[...]}
  components={{
    CustomRow,
    CustomDragPreview: (props) => <div className="drag-preview" {...props} />
  }}
/>
```

This grants the developer full control over what is rendered in each child
component, while allowing the headless component to manage its overall
structure.

You can even allow developers to customise the root element of your component
via a prop. For example, this button component allows a developer to render it
as something else:

```jsx
import { type ElementType } from 'react'

function HeadlessButton({ as, ...props }: { as?: ElementType }) {
  const Component = as ?? 'button'
  return <Component {...props} />
}
```

For example, in order for assistive technology to treat the button like a link,
the developer can specify that an anchor element should be used to render the
button:

```jsx
<HeadlessButton as="a">Actually a link</HeadlessButton>
```

## Summary

Headless components are much more than components that don&apos;t contain any
styles. Great headless components are fully extensible and allow the developer
to customise the entire internal HTML structure.
