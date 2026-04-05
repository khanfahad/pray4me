import SwiftUI
import AuthenticationServices

struct LoginView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var isAnimating = false

    var body: some View {
        ZStack {
            AppTheme.warmWhite.ignoresSafeArea()

            VStack(spacing: 0) {
                // Header
                ZStack {
                    LinearGradient(
                        gradient: Gradient(colors: [AppTheme.darkGreen, AppTheme.primaryGreen]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )

                    GeometricPatternView()
                        .opacity(0.06)

                    VStack(spacing: 16) {
                        Spacer()

                        Image(systemName: "moon.stars.fill")
                            .font(.system(size: 48))
                            .foregroundColor(AppTheme.accentGold)
                            .scaleEffect(isAnimating ? 1.05 : 1.0)
                            .animation(
                                .easeInOut(duration: 2).repeatForever(autoreverses: true),
                                value: isAnimating
                            )

                        Text("Pray4Me")
                            .font(.system(size: 36, weight: .bold, design: .serif))
                            .foregroundColor(.white)

                        Text("Request duas from Muslims\nat the holiest sites")
                            .font(AppTheme.body(15))
                            .foregroundColor(.white.opacity(0.85))
                            .multilineTextAlignment(.center)

                        Spacer()
                    }
                    .padding(.top, 40)
                }
                .frame(height: UIScreen.main.bounds.height * 0.45)

                // Sign In Buttons
                VStack(spacing: 16) {
                    Spacer()

                    Text("Sign in to continue")
                        .font(AppTheme.subheading(16))
                        .foregroundColor(AppTheme.charcoal)

                    // Google Sign In
                    Button {
                        Task { await authViewModel.signInWithGoogle() }
                    } label: {
                        HStack(spacing: 12) {
                            Image(systemName: "g.circle.fill")
                                .font(.title2)
                            Text("Continue with Google")
                                .fontWeight(.medium)
                        }
                        .foregroundColor(AppTheme.charcoal)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color.white)
                        .cornerRadius(AppTheme.cornerRadius)
                        .shadow(color: .black.opacity(0.08), radius: 4, x: 0, y: 2)
                    }

                    // Apple Sign In
                    SignInWithAppleButton(.signIn) { request in
                        authViewModel.handleAppleSignInRequest(request)
                    } onCompletion: { result in
                        Task { await authViewModel.handleAppleSignInCompletion(result) }
                    }
                    .signInWithAppleButtonStyle(.black)
                    .frame(height: 50)
                    .cornerRadius(AppTheme.cornerRadius)

                    // Facebook Sign In
                    Button {
                        Task { await authViewModel.signInWithFacebook() }
                    } label: {
                        HStack(spacing: 12) {
                            Image(systemName: "f.circle.fill")
                                .font(.title2)
                            Text("Continue with Facebook")
                                .fontWeight(.medium)
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color(hex: "1877F2"))
                        .cornerRadius(AppTheme.cornerRadius)
                    }

                    Spacer()

                    if let error = authViewModel.errorMessage {
                        Text(error)
                            .font(AppTheme.caption())
                            .foregroundColor(.red)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }

                    Spacer().frame(height: 20)
                }
                .padding(.horizontal, AppTheme.paddingLarge)
            }
        }
        .onAppear { isAnimating = true }
    }
}

struct SplashView: View {
    var body: some View {
        ZStack {
            AppTheme.darkGreen.ignoresSafeArea()

            VStack(spacing: 16) {
                Image(systemName: "moon.stars.fill")
                    .font(.system(size: 48))
                    .foregroundColor(AppTheme.accentGold)

                Text("Pray4Me")
                    .font(.system(size: 32, weight: .bold, design: .serif))
                    .foregroundColor(.white)

                ProgressView()
                    .tint(.white)
            }
        }
    }
}
