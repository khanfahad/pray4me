import Foundation
import FirebaseAuth
import GoogleSignIn
import AuthenticationServices
import CryptoKit

@MainActor
final class AuthViewModel: ObservableObject {
    @Published var isSignedIn = false
    @Published var isLoading = true
    @Published var currentUser: AppUser?
    @Published var errorMessage: String?

    // For Apple Sign In
    private var currentNonce: String?

    init() {
        checkAuthState()
    }

    // MARK: - Auth State

    private func checkAuthState() {
        if let firebaseUser = Auth.auth().currentUser {
            Task {
                await loadUser(firebaseUser: firebaseUser)
                isLoading = false
            }
        } else {
            isLoading = false
        }
    }

    private func loadUser(firebaseUser: FirebaseAuth.User) async {
        do {
            if let appUser = try await FirebaseService.shared.getUser(id: firebaseUser.uid) {
                currentUser = appUser
                isSignedIn = true
            } else {
                // User exists in Auth but not in Firestore — create profile
                let newUser = AppUser.new(
                    id: firebaseUser.uid,
                    email: firebaseUser.email ?? "",
                    displayName: firebaseUser.displayName ?? "Muslim",
                    photoURL: firebaseUser.photoURL?.absoluteString,
                    provider: .google
                )
                try await FirebaseService.shared.createOrUpdateUser(newUser)
                currentUser = newUser
                isSignedIn = true
            }
        } catch {
            errorMessage = "Failed to load profile. Please try again."
        }
    }

    // MARK: - Google Sign In

    func signInWithGoogle() async {
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let rootViewController = windowScene.windows.first?.rootViewController else {
            errorMessage = "Unable to find root view controller."
            return
        }

        do {
            let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: rootViewController)
            guard let idToken = result.user.idToken?.tokenString else {
                errorMessage = "Missing Google ID token."
                return
            }

            let credential = GoogleAuthProvider.credential(
                withIDToken: idToken,
                accessToken: result.user.accessToken.tokenString
            )

            let authResult = try await Auth.auth().signIn(with: credential)
            let firebaseUser = authResult.user

            let appUser = AppUser.new(
                id: firebaseUser.uid,
                email: firebaseUser.email ?? "",
                displayName: firebaseUser.displayName ?? "Muslim",
                photoURL: firebaseUser.photoURL?.absoluteString,
                provider: .google
            )

            try await FirebaseService.shared.createOrUpdateUser(appUser)
            currentUser = appUser
            isSignedIn = true
        } catch {
            errorMessage = "Google sign in failed: \(error.localizedDescription)"
        }
    }

    // MARK: - Facebook Sign In

    func signInWithFacebook() async {
        // Facebook Login requires the Facebook SDK
        // Implementation uses FBSDKLoginKit:
        //
        // let loginManager = LoginManager()
        // loginManager.logIn(permissions: ["email", "public_profile"]) { result in
        //     guard let token = AccessToken.current?.tokenString else { return }
        //     let credential = FacebookAuthProvider.credential(withAccessToken: token)
        //     Auth.auth().signIn(with: credential) { ... }
        // }
        //
        // For now, show a placeholder message
        errorMessage = "Facebook login will be available soon. Please use Google or Apple Sign In."
    }

    // MARK: - Apple Sign In

    func handleAppleSignInRequest(_ request: ASAuthorizationAppleIDRequest) {
        let nonce = randomNonceString()
        currentNonce = nonce
        request.requestedScopes = [.fullName, .email]
        request.nonce = sha256(nonce)
    }

    func handleAppleSignInCompletion(_ result: Result<ASAuthorization, Error>) async {
        switch result {
        case .success(let authorization):
            guard let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential,
                  let appleIDToken = appleIDCredential.identityToken,
                  let idTokenString = String(data: appleIDToken, encoding: .utf8),
                  let nonce = currentNonce else {
                errorMessage = "Apple sign in failed: missing credentials."
                return
            }

            let credential = OAuthProvider.appleCredential(
                withIDToken: idTokenString,
                rawNonce: nonce,
                fullName: appleIDCredential.fullName
            )

            do {
                let authResult = try await Auth.auth().signIn(with: credential)
                let firebaseUser = authResult.user

                let displayName = [
                    appleIDCredential.fullName?.givenName,
                    appleIDCredential.fullName?.familyName
                ].compactMap { $0 }.joined(separator: " ")

                let appUser = AppUser.new(
                    id: firebaseUser.uid,
                    email: firebaseUser.email ?? "",
                    displayName: displayName.isEmpty ? (firebaseUser.displayName ?? "Muslim") : displayName,
                    photoURL: firebaseUser.photoURL?.absoluteString,
                    provider: .apple
                )

                try await FirebaseService.shared.createOrUpdateUser(appUser)
                currentUser = appUser
                isSignedIn = true
            } catch {
                errorMessage = "Apple sign in failed: \(error.localizedDescription)"
            }

        case .failure(let error):
            errorMessage = "Apple sign in failed: \(error.localizedDescription)"
        }
    }

    // MARK: - Sign Out

    func signOut() {
        do {
            try Auth.auth().signOut()
            GIDSignIn.sharedInstance.signOut()
            currentUser = nil
            isSignedIn = false
        } catch {
            errorMessage = "Failed to sign out: \(error.localizedDescription)"
        }
    }

    // MARK: - Apple Sign In Helpers

    private func randomNonceString(length: Int = 32) -> String {
        precondition(length > 0)
        var randomBytes = [UInt8](repeating: 0, count: length)
        let errorCode = SecRandomCopyBytes(kSecRandomDefault, randomBytes.count, &randomBytes)
        if errorCode != errSecSuccess {
            fatalError("Unable to generate nonce.")
        }
        let charset: [Character] = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        return String(randomBytes.map { charset[Int($0) % charset.count] })
    }

    private func sha256(_ input: String) -> String {
        let inputData = Data(input.utf8)
        let hashedData = SHA256.hash(data: inputData)
        return hashedData.compactMap { String(format: "%02x", $0) }.joined()
    }
}
