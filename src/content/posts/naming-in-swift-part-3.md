---
title: 'Naming in Swift Part 3: Boundary Words'
description: 'Naming in Swift Part 3: Boundary Words (Start, Stop, Finish, Complete, Begin & End).'
date: 2021-07-25
---

# Naming in Swift Part 3: Boundary Words

With the introduction of async/await to Swift, this article may have already aged poorly.
In fact I wrote the first draft of this for Objective-C, before Swift even existed!

There are some words that appear in pairs through Swift APIs:

- `start` and `stop`
- `start` and `finish`
- `begin` and `end`

I am calling these boundary words, as they delimit the boundarys of certain actions, events or processes.

Although theses words are considered synonyms of each other in plain English,
they take on distinct semantics and should no longer be considered synonyms in Swift.

Furthermore, due to this specialisation, there are certain pairings that make sense and some pairings that you don't see as often.
For example, you typically won't see `start()` paired with `end()`, nor `begin()` with `finish()` even though these constructs would be perfectly fine in ordinary English.

## About _start_ and _stop_

APIs use _start_ and _stop_ to convey a long-running task that is happening in human-perceivable time.

Here are some examples:

- `URLProtocol` has `startLoading()` and `stopLoading()`
- `AVCaptureSession` has `startRunning()` and `stopRunning()`
- `UIImageView` has `startAnimating()` and `stopAnimating()`

Things that can be stopped can usually be started again. This means the object will have state.
Where you see `startPerformingTask` and `stopPerformingTask` you often also see `isPerformingTask`.

## About _finish_

Sometimes _start_ is paired with _finish_.

Here are some examples:

- `AVAssetWriter` has `startWriting()` and `finishWriting(completionHandler:)`
- `PHContentEditingController` has `startContentEditing(…)` and `finishContentEditing(completionHandler:)`

Unlike _stop_, _finish_ is not simply the opposite of _start_.
It specifically denotes that there is some sort of final phase to the task.
For example, flushing the contents of a buffer, writing to the disk, or cleaning up resources.

## About _complete_

You see APIs with _complete_ when they have completion handlers.
The concept of completion specifically denotes the boundary of the task between the caller and callee.

Here are some examples with both _finish_ and _complete_:

- `AVAssetWriter.finishWriting(completionHandler:)`
- `HKWorkoutBuilder.finishWorkout(completion:)`

In these APIs, _finish_ is refering to the final phase of the task that needs to be performed before control is transferred back to the caller in the completion handler.

## About _begin_ and _end_

These pairs normally appear within the same lexical code block, and are used to group operations into batches, transactions or other constructs.

Here are some examples:

- `UITableView` has `beginUpdates` and `endUpdates`
- `MTLCaptureScope` has `begin` and `end`
- `OSSignposter` has `beginInterval` and `endInterval`

These APIs were much more common in Objective-C prior to the introduction of block syntax.
In Swift these would be good candidates to improve using closures.

## Counter-examples

When writing this I did find a lot of examples in Apple's APIs that contradicted my definitions above.

For one, in the Swift Standard Library, collections have a _start_ index and _end_ index.

These definitions aren't hard rules, but I believe they are more consistent than not and that makes them worthwhile to know.
Many design patterns that have corresponding vocabulary already defined.
If possible, why not use a common vocabulary — it will only make your APIs feel more at home.
