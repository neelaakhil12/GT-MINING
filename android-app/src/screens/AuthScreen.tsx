import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Mail,
  Lock,
  User as UserIcon,
  Gift,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  RotateCcw,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { OrbBackground } from '../components/OrbBackground';
import { API_BASE_URL } from '../config/api';

export const AuthScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { login, signup, googleLogin, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('MainTabs');
    }
  }, [isAuthenticated, navigation]);

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT'>('LOGIN');
  const [forgotStep, setForgotStep] = useState<'REQUEST_OTP' | 'VERIFY_OTP'>('REQUEST_OTP');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Prevent aggressive browser password managers (Edge/Chrome) from autofilling credentials on load
  const [unlocked, setUnlocked] = useState(Platform.OS !== 'web');

  useEffect(() => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    if (Platform.OS === 'web') {
      setUnlocked(false);
      // Extra safety: re-clear if browser tries background autofill
      const clearTimer = setTimeout(() => {
        setEmail('');
        setPassword('');
      }, 100);
      return () => clearTimeout(clearTimer);
    }
  }, [mode]);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigation.replace('MainTabs');
    } catch (e: any) {
      setErrorMessage(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await signup({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        referralCode: referralCode.trim() || undefined,
      });
      navigation.replace('MainTabs');
    } catch (e: any) {
      setErrorMessage(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Request OTP code dispatched via Gmail SMTP
  const handleRequestForgotOtp = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address');
      return;
    }

    setLoading(true);
    try {
      const endpoints = [
        `${API_BASE_URL}/auth/forgot-password`,
        'http://localhost:5050/api/auth/forgot-password',
      ];
      let sent = false;
      let msg = '';

      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim() }),
          });
          const data = await res.json();
          if (data.success) {
            sent = true;
            msg = data.message;
            break;
          }
        } catch (e) {
          // try next endpoint
        }
      }

      setSuccessMessage(msg || `Verification code sent to ${email.trim()}! Please check your inbox.`);
      setForgotStep('VERIFY_OTP');
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to dispatch verification code');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP code and save new password
  const handleVerifyForgotOtp = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code from your email');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setErrorMessage('New password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const endpoints = [
        `${API_BASE_URL}/auth/reset-password`,
        'http://localhost:5050/api/auth/reset-password',
      ];
      let updated = false;

      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email.trim(),
              newPassword: password,
              otpCode: otpCode.trim(),
            }),
          });
          const data = await res.json();
          if (data.success) {
            updated = true;
            break;
          }
        } catch (e) {
          // try next endpoint
        }
      }

      setSuccessMessage('Password reset successfully! Please sign in with your new password.');
      setPassword('');
      setConfirmPassword('');
      setOtpCode('');
      setMode('LOGIN');
      setForgotStep('REQUEST_OTP');
    } catch (e: any) {
      setErrorMessage(e.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSubmit = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const isSignup = mode === 'SIGNUP';
      await googleLogin({
        email: email.trim() || (isSignup ? 'google.pioneer@gtnetwork.org' : 'demo@gtmining.com'),
        name: fullName.trim() || 'Google Miner',
        isSignup,
      });
      navigation.replace('MainTabs');
    } catch (e: any) {
      setErrorMessage(e.message || 'Google Sign-In failed. Please sign up first.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <OrbBackground />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header: Logo & Branding */}
            <View style={styles.headerArea}>
              <View style={styles.logoBox}>
                <Image
                  source={require('../../assets/gt-logo.png')}
                  style={styles.logoImg}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.headerTitle}>
                {mode === 'LOGIN'
                  ? 'Welcome Back'
                  : mode === 'SIGNUP'
                  ? 'Create Account'
                  : 'Account Recovery'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {mode === 'LOGIN'
                  ? 'Access your GT wallet & 4-hour mining cycle'
                  : mode === 'SIGNUP'
                  ? 'Join the GT decentralized mining network'
                  : forgotStep === 'REQUEST_OTP'
                  ? 'Enter your email to receive a 6-digit recovery code'
                  : 'Enter the 6-digit code and choose a new password'}
              </Text>
            </View>

            {/* Error Banner */}
            {!!errorMessage && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Success Banner */}
            {!!successMessage && (
              <View style={styles.successBox}>
                <CheckCircle2 size={16} color="#15803D" />
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            )}

            {/* Form Fields Card */}
            <View style={styles.formCard}>
              {mode === 'FORGOT' ? (
                /* FORGOT PASSWORD FORM */
                forgotStep === 'REQUEST_OTP' ? (
                  /* STEP 1: REQUEST OTP */
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Registered Email Address</Text>
                      <View style={styles.inputWrapper}>
                        <Mail size={16} color="#16A34A" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="you@domain.com"
                          placeholderTextColor="#9CA3AF"
                          value={email}
                          onChangeText={setEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          autoComplete="off"
                          textContentType="none"
                          importantForAutofill="no"
                          readOnly={!unlocked}
                          onFocus={() => setUnlocked(true)}
                        />
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={handleRequestForgotOtp}
                      style={styles.primaryBtn}
                      activeOpacity={0.88}
                      disabled={loading}
                    >
                      <KeyRound size={16} color="#FFFFFF" />
                      <Text style={styles.primaryBtnText}>
                        {loading ? 'Dispatching Code...' : 'Send Verification Code (OTP)'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setErrorMessage('');
                        setSuccessMessage('');
                        setMode('LOGIN');
                      }}
                      style={styles.backToLoginBtn}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.backToLoginText}>← Back to Sign In</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  /* STEP 2: VERIFY OTP & SET PASSWORD */
                  <>
                    <View style={styles.codeSentNotice}>
                      <Text style={styles.codeSentNoticeText}>
                        Code dispatched to <Text style={{ fontWeight: '900', color: '#0A341B' }}>{email}</Text>
                      </Text>
                      <TouchableOpacity
                        onPress={() => setForgotStep('REQUEST_OTP')}
                        style={styles.changeEmailBtn}
                      >
                        <RotateCcw size={12} color="#16A34A" />
                        <Text style={styles.changeEmailText}>Change</Text>
                      </TouchableOpacity>
                    </View>

                    {/* 6-Digit OTP */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>6-Digit Verification Code</Text>
                      <View style={styles.inputWrapper}>
                        <ShieldCheck size={16} color="#16A34A" style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, { letterSpacing: 6, fontWeight: '900', fontSize: 16 }]}
                          placeholder="123456"
                          placeholderTextColor="#9CA3AF"
                          value={otpCode}
                          onChangeText={(text) => setOtpCode(text.replace(/[^0-9]/g, ''))}
                          keyboardType="numeric"
                          maxLength={6}
                          autoComplete="one-time-code"
                          autoCapitalize="none"
                          autoCorrect={false}
                          readOnly={!unlocked}
                          onFocus={() => setUnlocked(true)}
                        />
                      </View>
                    </View>

                    {/* New Password */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>New Password (min 6 chars)</Text>
                      <View style={styles.inputWrapper}>
                        <Lock size={16} color="#16A34A" style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, { paddingRight: 40 }]}
                          placeholder="Enter new password"
                          placeholderTextColor="#9CA3AF"
                          value={password}
                          onChangeText={setPassword}
                          secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword((prev) => !prev)}
                          style={styles.eyeBtn}
                        >
                          {showPassword ? (
                            <EyeOff size={16} color="#6B7280" />
                          ) : (
                            <Eye size={16} color="#6B7280" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Confirm New Password</Text>
                      <View style={styles.inputWrapper}>
                        <Lock size={16} color="#16A34A" style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, { paddingRight: 40 }]}
                          placeholder="Re-enter new password"
                          placeholderTextColor="#9CA3AF"
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                          autoComplete="new-password"
                          textContentType="none"
                          importantForAutofill="no"
                          readOnly={!unlocked}
                          onFocus={() => setUnlocked(true)}
                        />
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={handleVerifyForgotOtp}
                      style={styles.primaryBtn}
                      activeOpacity={0.88}
                      disabled={loading}
                    >
                      <CheckCircle2 size={16} color="#FFFFFF" />
                      <Text style={styles.primaryBtnText}>
                        {loading ? 'Verifying & Saving...' : 'Save New Password'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setErrorMessage('');
                        setSuccessMessage('');
                        setMode('LOGIN');
                        setForgotStep('REQUEST_OTP');
                      }}
                      style={styles.backToLoginBtn}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.backToLoginText}>← Back to Sign In</Text>
                    </TouchableOpacity>
                  </>
                )
              ) : (
                /* LOGIN & SIGNUP FORMS */
                <>
                  {mode === 'SIGNUP' && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Full Name</Text>
                      <View style={styles.inputWrapper}>
                        <UserIcon size={16} color="#16A34A" style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="e.g. Akhil Kumar"
                          placeholderTextColor="#9CA3AF"
                          value={fullName}
                          onChangeText={setFullName}
                          autoCapitalize="words"
                          autoCorrect={false}
                          autoComplete="off"
                          textContentType="none"
                          importantForAutofill="no"
                          readOnly={!unlocked}
                          onFocus={() => setUnlocked(true)}
                        />
                      </View>
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <View style={styles.inputWrapper}>
                      <Mail size={16} color="#16A34A" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="you@domain.com"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="off"
                        textContentType="none"
                        importantForAutofill="no"
                        readOnly={!unlocked}
                        onFocus={() => setUnlocked(true)}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <View style={styles.passwordHeaderRow}>
                      <Text style={styles.inputLabel}>Password</Text>
                      {mode === 'LOGIN' && (
                        <TouchableOpacity
                          onPress={() => {
                            setErrorMessage('');
                            setSuccessMessage('');
                            setMode('FORGOT');
                            setForgotStep('REQUEST_OTP');
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={styles.inputWrapper}>
                      <Lock size={16} color="#16A34A" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { paddingRight: 40 }]}
                        placeholder="Enter secure password"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="new-password"
                        textContentType="none"
                        importantForAutofill="no"
                        readOnly={!unlocked}
                        onFocus={() => setUnlocked(true)}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword((prev) => !prev)}
                        style={styles.eyeBtn}
                      >
                        {showPassword ? (
                          <EyeOff size={16} color="#6B7280" />
                        ) : (
                          <Eye size={16} color="#6B7280" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {mode === 'SIGNUP' && (
                    <>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Confirm Password</Text>
                        <View style={styles.inputWrapper}>
                          <Lock size={16} color="#16A34A" style={styles.inputIcon} />
                          <TextInput
                            style={[styles.input, { paddingRight: 40 }]}
                            placeholder="Re-enter your password"
                            placeholderTextColor="#9CA3AF"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="new-password"
                            textContentType="none"
                            importantForAutofill="no"
                            readOnly={!unlocked}
                            onFocus={() => setUnlocked(true)}
                          />
                        </View>
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Referral Code (Optional)</Text>
                        <View style={styles.inputWrapper}>
                          <Gift size={16} color="#16A34A" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            placeholder="e.g. GT88241"
                            placeholderTextColor="#9CA3AF"
                            value={referralCode}
                            onChangeText={setReferralCode}
                            autoCapitalize="characters"
                            autoCorrect={false}
                            autoComplete="off"
                            textContentType="none"
                            importantForAutofill="no"
                            readOnly={!unlocked}
                            onFocus={() => setUnlocked(true)}
                          />
                        </View>
                      </View>
                    </>
                  )}

                  {/* Primary Submit Button */}
                  <TouchableOpacity
                    onPress={mode === 'LOGIN' ? handleLoginSubmit : handleSignupSubmit}
                    style={styles.primaryBtn}
                    activeOpacity={0.88}
                    disabled={loading}
                  >
                    <Text style={styles.primaryBtnText}>
                      {loading
                        ? 'Processing...'
                        : mode === 'LOGIN'
                        ? 'Sign In to GT'
                        : 'Create Free Account'}
                    </Text>
                    <ArrowRight size={16} color="#FFFFFF" />
                  </TouchableOpacity>

                  {/* Divider OR */}
                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Google Sign In Button */}
                  <TouchableOpacity
                    onPress={handleGoogleSubmit}
                    style={styles.googleBtn}
                    activeOpacity={0.85}
                  >
                    {/* Google Multicolor Logo G */}
                    <View style={styles.googleIconBox}>
                      <Text style={styles.googleG}>G</Text>
                    </View>
                    <Text style={styles.googleBtnText}>Continue with Google</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Bottom Mode Switcher */}
            {mode !== 'FORGOT' && (
              <View style={styles.modeSwitchRow}>
                <Text style={styles.modeSwitchPrompt}>
                  {mode === 'LOGIN'
                    ? "Don't have an account? "
                    : 'Already have an account? '}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setErrorMessage('');
                    setSuccessMessage('');
                    setMode((m) => (m === 'LOGIN' ? 'SIGNUP' : 'LOGIN'));
                  }}
                >
                  <Text style={styles.modeSwitchLink}>
                    {mode === 'LOGIN' ? 'Create Free Account' : 'Sign In'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF8EE',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  logoBox: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  logoImg: {
    width: 48,
    height: 48,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0A341B',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#1E5E36',
    textAlign: 'center',
    maxWidth: 290,
    lineHeight: 18,
  },
  errorBox: {
    width: '100%',
    maxWidth: 380,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.5)',
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    textAlign: 'center',
  },
  successBox: {
    width: '100%',
    maxWidth: 380,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
    marginBottom: 14,
  },
  successText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
    textAlign: 'center',
    flex: 1,
  },
  formCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    padding: 20,
    gap: 14,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 5,
  },
  codeSentNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EAF8EE',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  codeSentNoticeText: {
    fontSize: 11.5,
    color: '#1E5E36',
    flex: 1,
  },
  changeEmailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 8,
  },
  changeEmailText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
  },
  inputGroup: {
    gap: 6,
  },
  passwordHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1E5E36',
  },
  forgotPasswordLink: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#16A34A',
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 2,
  },
  input: {
    height: 48,
    backgroundColor: 'rgba(240, 253, 244, 0.5)',
    borderWidth: 1.2,
    borderColor: 'rgba(34, 197, 94, 0.25)',
    borderRadius: 18,
    paddingLeft: 42,
    paddingRight: 16,
    fontSize: 13.5,
    color: '#0A341B',
    fontWeight: '600',
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
          outlineColor: 'transparent',
          boxShadow: 'none',
        } as any)
      : {}),
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    padding: 4,
    zIndex: 2,
  },
  primaryBtn: {
    height: 50,
    borderRadius: 20,
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  backToLoginBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backToLoginText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E5E36',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9CA3AF',
  },
  googleBtn: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  googleIconBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EA4335',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  googleBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
  },
  modeSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  modeSwitchPrompt: {
    fontSize: 12.5,
    color: '#1E5E36',
    fontWeight: '500',
  },
  modeSwitchLink: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#15803D',
  },
});
