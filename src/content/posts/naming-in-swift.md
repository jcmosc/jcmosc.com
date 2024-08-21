---
title: 'Naming in Swift Part 1'
description: 'Naming in Swift Part 1.'
date: 2021-06-29
---

# Naming in Swift Part 1

While there is lots of writing on programming style, syntax and formatting, I've seen very little centred on vocabulary.
Most writing that I've come across tends to focus on vague outcomes like "make names clear and consise" without actually telling you what words to use.

I originally meant to write this series for Objective-C before Swift came onto the scene.
Nonetheless I think this will still be relevant. After all, Swift was designed to be interoperable with Objective-C and owes it a lot of its design.

Like human languages, programming languages have their own etymology.
Swift's etymological roots can be found in the Cocoa and Cocoa Touch APIs written in Objective-C.
While the vocabulary comes from Foundation and related frameworks, I would argue that the development of this vocabulary was influenced by a feature of the language, specifically message passing.

## The influence of message passing

Message passing, being the method of communication between objects in Objective-C, actually comes from Smalltalk.

In languages that use message passing, the message is a top-level concept. In Objective-C, a message is called a selector and can be stored in a variable of type `SEL`.
Message passing can be contrasted with method calling, where methods are bound to a type and must be called on an instance of that type.

In Objective-C a selector can be sent to any object, regardless of the object's type.
Objects need to be prepared to receive any selector, even if they don't know how to respond to it.
This behaviour is on full display in the application responder chain where objects may be asked to handle the `cut:`, `copy:`, `paste:` and other actions.

Since objects need to be prepared to handle any selector, you could argue that selectors have a greater burden to convey their semantics than methods.
Selectors do not have the benefit of being bound to a type that can provide additional semantic context. The name of a selector must be unambigious and make sense on its own.
I believe these constraints had a large influence on the verbosity that Objective-C became known for.

I like to use an analogy with organic chemistry. Acetic acid and ethanoic acid both refer to the same chemical.
But only "ethanoic acid" unambigously descibes the chemical's molecular structure using the IUPAC systematic naming conventions.
Names in Objectice-C work in a similar way in that their verbosity encodes important semantic information.
In this sense I would describe Objective-C APIs not as verbose but as precise.

## Swift vocabulary today

Programming is a technial profession, and like most technical professions it has specialised language and jargon.
While every profession comes with its own jargon, what is unique to programming is that the creation of new language isn't
something that's confined to acedemia and research — it is literally our everyday jobs.

Programming concepts really only exist in our heads, so giving something a name is what makes it real and understandable.
For something so integral to our profession it is a shame that we don't give much guidance beyond an acknowledgment that naming is hard.

Static typing, generics and type inference enable Swift APIs to be much more concise than Objective-C _without losing semantics_.
Yet the importance of getting the name right isn't diminished and much of the vocabulary from Objective-C remains relevant today.

This series will focus on the precise meanings of words that are treated as synonyms in ordinary English but have distinct meanings when used in Swift APIs.
