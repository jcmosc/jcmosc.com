---
title: 'Testing Standard Output in Swift'
description:
  'Temporarily print standard output to a custom text output stream in Swift'
date: 2025-04-30
---

## Testing Standard Output in Swift

Recently I have been writing unit tests against a third-party library. Since I
don't have access to the source code of this library, one of the only ways I
have access to verify its behavior is to inspect what it prints to standard
output.

Intercepting the contents of standard output from within a running Swift program
is not straightforward. I wanted to avoid spawning a subprocess for each test as
I am writing unit tests against individual function calls of a library, not the
execution of binary.

Ideally there would be a simple function that allows you to write a unit test
like the following:

```swift
import Testing

@Test func testStandardOutput() {
    var output = ""
    printingStandardOutput(to: &output) {
        // code under test here
    }
    #expect(output == "expected output")
}
```

No such function exists but we can build it.

The following code is mostly adapted from
[@phatblat](https://twitter.com/phatblat)'s post
[Intercepting stdout in Swift](https://phatbl.at/2019/01/08/intercepting-stdout-in-swift.html).

I've altered it slightly to fit the closure-based API above as well as to use an
end of file signal to terminate the stream. The clean up logic is based on
[this StackOverflow post](https://stackoverflow.com/questions/14500000/undo-redirect-of-stdout-with-dup2).

```swift
import Foundation

/// Additionally writes any data written to standard output into the given
/// output stream.
///
/// - Parameters:
///   - output: An output stream to receive the standard output text
///   - encoding: The encoding to use when converting standard output into text.
///   - body: A closure that is executed immediately.
/// - Returns: The return value, if any, of the `body` closure.
func printingStandardOutput<T>(to output: inout TextOutputStream,
                               encoding: String.Encoding = .utf8,
                               body: () -> T) async -> T {
    var result: T? = nil

    let consumer = Pipe()  // reads from stdout
    let producer = Pipe()  // writes to stdout

    let stream = AsyncStream<Data> { continuation in
        let clonedStandardOutput = dup(STDOUT_FILENO)
        defer {
            dup2(clonedStandardOutput, STDOUT_FILENO)
            close(clonedStandardOutput)
        }

        dup2(STDOUT_FILENO, producer.fileHandleForWriting.fileDescriptor)
        dup2(consumer.fileHandleForWriting.fileDescriptor, STDOUT_FILENO)

        consumer.fileHandleForReading.readabilityHandler = { fileHandle in
            let data = fileHandle.availableData
            if data.isEmpty {
                continuation.finish()
            } else {
                continuation.yield(data)
                producer.fileHandleForWriting.write(data)
            }
        }

        result = body()
        try! consumer.fileHandleForWriting.close()
    }

    for await chunk in stream {
        output.write(String(data: chunk, encoding: encoding)!)
    }

    return result!
}
```

## How it works

First we create two Pipe objects. One to intercept standard output and the other
to write back to it:

```swift
let consumer = Pipe()  // reads from stdout
let producer = Pipe()  // writes to stdout
```

Next, we build an async stream to write to the given output stream. This is
necessary as our callback will be called concurrently and we won't be able to
capture any non-sendable types:

```
let stream = AsyncStream<Data> { continuation in
    // ...
}
```

Since we want our unit test to be isolated and repeatable, we need to restore
any changes we make to the system file descriptors:

```swift
let clonedStandardOutput = dup(STDOUT_FILENO)
defer {
    dup2(clonedStandardOutput, STDOUT_FILENO)
    close(clonedStandardOutput)
}
```

The above code clones standard output to a new file descriptor, which we later
use to restore its state when the scope exists.

These next lines are what actually cause standard output to be diverted to our
custom pipe. We have one pipe for intercepting standard output and other for
replaying it:

```swift
dup2(STDOUT_FILENO, producer.fileHandleForWriting.fileDescriptor)
dup2(consumer.fileHandleForWriting.fileDescriptor, STDOUT_FILENO)
```

The code for intercepting data, diverting and replaying it is fairly
straightforward:

```swift
consumer.fileHandleForReading.readabilityHandler = { fileHandle in
    let data = fileHandle.availableData
    if data.isEmpty {
        continuation.finish()
    } else {
        continuation.yield(data)
        producer.fileHandleForWriting.write(data)
    }
}
```

The main thing to call out is that when the `Data` value returned from
`FileHandle.availableData` is empty, it actually means that the end of the file
was reached. The code uses this to terminate the async stream. Otherwise the
test will hang.

Lastly we actaully call the given body closure and immediately send an end of
file event:

```swift
result = body()
try! consumer.fileHandleForWriting.close()
```

All that's left to do now is read the data off the async stream and write it to
the custom text output stream:

```swift
for await chunk in stream {
    output.write(String(data: chunk, encoding: encoding)!)
}
```

## Writing unit tests

Using this function in a test is exactly as written above. Don't forget to
specify that your tests should run serialized, otherwise output may become
interleaved!

```swift
import Testing

@Suite(.serialized)
struct StandardOutputTests {

    @Test func testStandardOutput() {
        var output = ""
        printingStandardOutput(to: &output) {
            // code under test here
        }
        #expect(output == "expected output")
    }

    @Test func testStandardOutputWithResult() {
        var output = ""
        let result = printingStandardOutput(to: &output) {
            // code under test here
            return value
        }
        #expect(result == "expected result")
        #expect(output == "expected output")
    }

}
```
