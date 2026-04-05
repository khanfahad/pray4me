import Foundation
import CoreLocation
import Combine

@MainActor
final class LocationViewModel: ObservableObject {
    @Published var isAtHolySite = false
    @Published var currentSite: HolySite?
    @Published var locationError: String?
    @Published var hasLocationPermission = false

    private let locationService = LocationService.shared
    private var cancellables = Set<AnyCancellable>()

    init() {
        setupBindings()
    }

    private func setupBindings() {
        locationService.$isAtHolySite
            .receive(on: DispatchQueue.main)
            .assign(to: &$isAtHolySite)

        locationService.$currentHolySite
            .receive(on: DispatchQueue.main)
            .assign(to: &$currentSite)

        locationService.$locationError
            .receive(on: DispatchQueue.main)
            .assign(to: &$locationError)

        locationService.$authorizationStatus
            .receive(on: DispatchQueue.main)
            .map { status in
                status == .authorizedWhenInUse || status == .authorizedAlways
            }
            .assign(to: &$hasLocationPermission)
    }

    func requestLocationPermission() {
        locationService.requestPermission()
    }

    func startMonitoring() {
        locationService.startMonitoring()
    }

    func stopMonitoring() {
        locationService.stopMonitoring()
    }

    #if DEBUG
    func simulateHolySite(_ site: HolySite) {
        locationService.simulateLocation(site: site)
    }

    func clearSimulation() {
        locationService.clearSimulation()
    }
    #endif
}
