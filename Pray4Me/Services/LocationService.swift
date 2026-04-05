import Foundation
import CoreLocation
import Combine

final class LocationService: NSObject, ObservableObject {
    static let shared = LocationService()

    private let locationManager = CLLocationManager()

    @Published var currentLocation: CLLocation?
    @Published var currentHolySite: HolySite?
    @Published var isAtHolySite: Bool = false
    @Published var authorizationStatus: CLAuthorizationStatus = .notDetermined
    @Published var locationError: String?

    private override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.distanceFilter = 50 // Update every 50 meters
        locationManager.allowsBackgroundLocationUpdates = false
    }

    // MARK: - Public Methods

    func requestPermission() {
        locationManager.requestWhenInUseAuthorization()
    }

    func startMonitoring() {
        locationManager.startUpdatingLocation()
        startMonitoringHolySites()
    }

    func stopMonitoring() {
        locationManager.stopUpdatingLocation()
        stopMonitoringHolySites()
    }

    // MARK: - Geofencing

    private func startMonitoringHolySites() {
        for site in HolySite.allCases {
            locationManager.startMonitoring(for: site.region)
        }
    }

    private func stopMonitoringHolySites() {
        for site in HolySite.allCases {
            locationManager.stopMonitoring(for: site.region)
        }
    }

    /// Check current location against all holy sites
    func checkCurrentSite() {
        guard let location = currentLocation else {
            currentHolySite = nil
            isAtHolySite = false
            return
        }

        for site in HolySite.allCases {
            let siteLocation = CLLocation(
                latitude: site.coordinate.latitude,
                longitude: site.coordinate.longitude
            )
            let distance = location.distance(from: siteLocation)

            if distance <= site.radius {
                currentHolySite = site
                isAtHolySite = true
                return
            }
        }

        currentHolySite = nil
        isAtHolySite = false
    }

    /// For testing: simulate being at a holy site
    #if DEBUG
    func simulateLocation(site: HolySite) {
        currentLocation = CLLocation(
            latitude: site.coordinate.latitude,
            longitude: site.coordinate.longitude
        )
        currentHolySite = site
        isAtHolySite = true
    }

    func clearSimulation() {
        currentHolySite = nil
        isAtHolySite = false
    }
    #endif
}

// MARK: - CLLocationManagerDelegate

extension LocationService: CLLocationManagerDelegate {
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        authorizationStatus = manager.authorizationStatus

        switch manager.authorizationStatus {
        case .authorizedWhenInUse, .authorizedAlways:
            startMonitoring()
        case .denied, .restricted:
            locationError = "Location access is required to make dua at holy sites. Please enable it in Settings."
        default:
            break
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        currentLocation = location
        checkCurrentSite()
    }

    func locationManager(_ manager: CLLocationManager, didEnterRegion region: CLRegion) {
        if let site = HolySite.allCases.first(where: { $0.rawValue == region.identifier }) {
            currentHolySite = site
            isAtHolySite = true
        }
    }

    func locationManager(_ manager: CLLocationManager, didExitRegion region: CLRegion) {
        if region.identifier == currentHolySite?.rawValue {
            currentHolySite = nil
            isAtHolySite = false
        }
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        locationError = error.localizedDescription
    }
}
