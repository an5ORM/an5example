// swift-tools-version: 5.9
//
// AN5 example package: the generated Swift client over the SQLite driver that ships with
// the AN5 runtime.
//
// Two dependencies, because that is what a consumer has: the runtime by URL, and the client
// this repository generates beside it by path. SwiftPM has no equivalent of Go's `replace`
// or Cargo's `[patch]`, so the generated client's own reference to the runtime is left as
// emitted — a checkout that must build without the network rewrites both URLs, which is what
// `test/swift-example-build.js` does.
//
// The package lives in a directory named after it rather than directly under `examples/swift`.
// SwiftPM identifies a package by the last path component of the directory holding this file,
// so a package named `swift` and the generated client in `generated/swift` would resolve to
// one package and depend on themselves.
import PackageDescription

let package = Package(
    name: "An5Example",
    dependencies: [
        .package(url: "https://github.com/an5ORM/an5Adapters.git", from: "0.2.11"),
        .package(path: "../../../generated/swift"),
    ],
    targets: [
        .executableTarget(
            name: "An5Example",
            dependencies: [
                .product(name: "An5Adapters", package: "an5Adapters"),
                .product(name: "An5Client", package: "swift"),
            ],
            path: "Sources/An5Example"
        ),
    ]
)
