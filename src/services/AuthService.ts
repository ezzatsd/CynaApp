import { Alert } from 'react-native';

// Simulate API calls with timeouts

interface User {
  id: string;
  name: string;
  email: string;
}

// Simulate a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const login = async (email: string, password: string): Promise<User | null> => {
  console.log('Attempting login with:', email, password); // Log input
  await delay(1000); // Simulate network request

  // Basic validation (replace with real API call)
  if (email.toLowerCase() === 'test@cyna.com' && password === 'password') {
    console.log('Login successful (simulated)');
    return {
      id: '123',
      name: 'Test User',
      email: email.toLowerCase(),
    };
  } else {
    console.log('Login failed (simulated)');
    Alert.alert("Erreur de connexion", "Email ou mot de passe incorrect.");
    return null;
  }
};

export const signUp = async (name: string, email: string, password: string): Promise<User | null> => {
  console.log('Attempting signup with:', name, email, password); // Log input
  await delay(1500); // Simulate network request

  // Basic validation (replace with real API call)
  if (name && email && password && password.length >= 8) {
    // Simulate successful signup - in a real app, the API would create the user
    console.log('Signup successful (simulated)');
    // Usually, after signup, the user might need email verification or be automatically logged in.
    // For simplicity, we'll return a user object as if logged in.
    Alert.alert("Inscription réussie", "Votre compte a été créé. Veuillez vous connecter.");
    return {
      id: Date.now().toString(), // Generate a dummy ID
      name: name,
      email: email.toLowerCase(),
    };
  } else {
    console.log('Signup failed (simulated)');
    let errorMessage = "Veuillez vérifier vos informations.";
    if (!name) errorMessage = "Le nom est requis.";
    else if (!email) errorMessage = "L'email est requis.";
    else if (!password) errorMessage = "Le mot de passe est requis.";
    else if (password.length < 8) errorMessage = "Le mot de passe doit contenir au moins 8 caractères.";

    Alert.alert("Erreur d'inscription", errorMessage);
    return null;
  }
};

export const forgotPassword = async (email: string): Promise<boolean> => {
    console.log('Attempting password reset for:', email);
    await delay(1000);
    if (email.toLowerCase() === 'test@cyna.com') {
        console.log('Password reset email sent (simulated)');
        Alert.alert("Email envoyé", "Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.");
        return true;
    } else {
        console.log('Password reset failed - user not found (simulated)');
        Alert.alert("Email envoyé", "Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.");
        return false;
    }
};

export const logout = async (): Promise<void> => {
  console.log('Logging out (simulated)');
  await delay(500);
  // In a real app, clear tokens, etc.
  return;
}; 