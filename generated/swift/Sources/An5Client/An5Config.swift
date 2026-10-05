// This file is auto-generated. Do not edit deliberately.
import Foundation
import An5Adapters

/// Where the connection string comes from.
///
/// The `AN5_DATABASE_URL` environment variable first, then the `AN5_CONNECTION_STRING`
/// Info.plist entry an app bundle carries, so one build can be pointed at a different
/// database without a recompile.
public enum An5Config {

    public static func connectionString() throws -> String {
        if let fromEnvironment = ProcessInfo.processInfo.environment["AN5_DATABASE_URL"],
           !fromEnvironment.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return fromEnvironment.trimmingCharacters(in: .whitespacesAndNewlines)
        }
        if let fromBundle = Bundle.main.object(forInfoDictionaryKey: "AN5_CONNECTION_STRING") as? String,
           !fromBundle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return fromBundle.trimmingCharacters(in: .whitespacesAndNewlines)
        }
        throw An5Error.configuration(
            "no connection string: set AN5_DATABASE_URL or the AN5_CONNECTION_STRING Info.plist entry")
    }
}
