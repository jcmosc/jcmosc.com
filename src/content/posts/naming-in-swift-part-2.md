---
title: 'Naming in Swift Part 2: Name, Title, Identifier & ID'
description: 'Naming in Swift Part 2: Name, Title, Identifier & ID.'
date: 2021-07-08
---

# Naming in Swift Part 2: Name, Title, Identifier & ID

Let’s start this series with a meta discussion about how to name properties that themselves are used to name, describe or otherwise identify things.
On Apple platforms, words used for these purposes are _name_, _title_, _identifier_ and more recently _id_.

## About _name_

Lots of things have names, especially things that are displayed in lists and other collections.
It is incredibly common for developers to give such types a string property called `name`, which gets displayed in their user interface.
This seems sensible at first, but it is actually a wrong usage of the word if you accept that words in APIs take on more precise meanings than they do in ordinary English.

When writing Swift APIs, calling a property `name` carries the implication that its value will be unique within some namespace.

Here are some examples:

- `Notification.name`
- `UIFont.fontName`
- `NSManagedObjectModel.entitiesByName`

When you see a type that has a `name` property, you will typically also see a way to look up values of that type via its name.
(Incidentally the convention is to name the argument label `[type]Named:` rather than `[type]WithName:`.)

This requirement that properties called `name` have unique values is what makes them unsuitable for storing user-facing text.
Users can't guarantee uniqueness when entering a value unless the interface also performs validation and rejects non-unique values.
But this would be a poorer experience than if the user could simply enter any value they want.
(File systems come to mind as one of the few scenarios where this does happen.)
To get around this you typically model types as having both a user-facing text property and an internal identifier property.
These properties should be called `title` and `identifier` respectively.

## About _title_

_Title_ is used for user-facing text that distinguishes an item from others.

Here are some examples:

- `UIMenuItem.title`
- `UIViewController.title`
- `NSUserActivity.title`

Sometimes _title_ might seem a overly formal or plain silly,
especially when you are inclined to say _name_ in ordinary English.
But for non-unique, user-facing text, _title_ is correct.
Even if the corresponding field has a prompt that says something like "give your new BLANK a name",
_title_ would still be the correct word to use for the property!

When you see a property called `title` you often also see a property called `localizedDescription` next to it.
Both are used for describing (as opposed to identifing).
The difference between the two is in their usage — think short headings versus long sentences.

## About _identifier_

Properties that contain unique identifiers are called, well, `identifier`.

Here are some examples:

- `CNContact.identifier`
- `EKEvent.eventIdentifier`
- `URLSessionConfiguration.identifier`

Both _name_ and _identifier_ imply uniqueness; values can be used as keys for lookup.
The difference is that properties called `name` are typically human readable (if only for development and debugging purposes),
whereas properties called `identifier` are typically opaque and generated randomly.

## About _id_

Swift 5.1 introduced the `Identifiable` protocol to the standard library.
Here you can see how the Swift programming language allows APIs to become more concise, or as some would say, _Swifty_.

APIs should be designed with the reader in mind. Abbreviations and initialisations should [usually be avoided](https://swift.org/documentation/api-design-guidelines/#avoid-abbreviations).
_ID_ is a fairly common initialisation and you can argue that shortening _identifier_ to _ID_ is sensible.
Doing so is much less problematic in Swift than in, say, Objective-C because the `var id: ID` property is statically associated with the `Identifiable` protocol, which provides additional semantic context.

There are some APIs written in Objective-C that do use _id_ instead of _identifier_, for example `NSManagedObject.objectID`
and `CKRecord.recordID`. Notice that the types of these properties are not `NSString` but the more semantic `NSManagedObjectID` and `CKRecordID` classes respectively.

## Oddballs

If you scour the frameworks that belong to the iOS and macOS SDKs you will see that these definitions mostly hold up.
That said, there are always exceptions. Properties called _localizedName_ have semantics closer to _title_ than _name_. In the new MusicKit framework, the `Playlist` type has a property called `name`, but it seems like it should have been called `title`. But please don't let a few inconsistences discourage you from designing your own APIs rigorously.
