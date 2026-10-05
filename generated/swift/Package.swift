// swift-tools-version: 5.9
// This file is auto-generated. Do not edit deliberately.
import PackageDescription

let package = Package(
    name: "An5Client",
    products: [
        .library(name: "An5Client", targets: ["An5Client"])
    ],
    dependencies: [
        .package(url: "https://github.com/an5ORM/an5Adapters.git", from: "0.2.11")
    ],
    targets: [
        .target(name: "An5Client", dependencies: [
            .product(name: "An5Adapters", package: "an5Adapters")
        ])
    ]
)
