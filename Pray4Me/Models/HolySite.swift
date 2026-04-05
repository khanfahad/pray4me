import Foundation
import CoreLocation

enum HolySite: String, Codable, CaseIterable, Identifiable {
    case masjidAlHaram = "masjid_al_haram"
    case mina = "mina"
    case muzdalifah = "muzdalifah"
    case arafat = "arafat"
    case masjidAnNabawi = "masjid_an_nabawi"

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .masjidAlHaram: return "Masjid al-Haram"
        case .mina: return "Mina"
        case .muzdalifah: return "Muzdalifah"
        case .arafat: return "Arafat"
        case .masjidAnNabawi: return "Masjid an-Nabawi"
        }
    }

    var city: String {
        switch self {
        case .masjidAlHaram, .mina, .muzdalifah, .arafat:
            return "Makkah"
        case .masjidAnNabawi:
            return "Madinah"
        }
    }

    var coordinate: CLLocationCoordinate2D {
        switch self {
        case .masjidAlHaram:
            return CLLocationCoordinate2D(latitude: 21.4225, longitude: 39.8262)
        case .mina:
            return CLLocationCoordinate2D(latitude: 21.4133, longitude: 39.8933)
        case .muzdalifah:
            return CLLocationCoordinate2D(latitude: 21.3997, longitude: 39.9167)
        case .arafat:
            return CLLocationCoordinate2D(latitude: 21.3547, longitude: 39.9842)
        case .masjidAnNabawi:
            return CLLocationCoordinate2D(latitude: 24.4672, longitude: 39.6112)
        }
    }

    /// Radius in meters for geofencing
    var radius: CLLocationDistance {
        switch self {
        case .masjidAlHaram: return 1000
        case .mina: return 2000
        case .muzdalifah: return 2000
        case .arafat: return 3000
        case .masjidAnNabawi: return 800
        }
    }

    var region: CLCircularRegion {
        let region = CLCircularRegion(
            center: coordinate,
            radius: radius,
            identifier: rawValue
        )
        region.notifyOnEntry = true
        region.notifyOnExit = true
        return region
    }
}
