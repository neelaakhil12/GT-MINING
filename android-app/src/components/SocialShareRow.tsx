import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Share } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

interface SocialShareRowProps {
  referralCode: string;
}

export const SocialShareRow: React.FC<SocialShareRowProps> = ({ referralCode }) => {
  const shareMessage = `⛏️ Join me on GT Mining! Mine virtual GT coins every 4 hours. Use my referral code: ${referralCode}`;

  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Haptics fallback
    }
  };

  const handleWhatsApp = () => {
    triggerHaptic();
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(shareMessage)}`).catch(() => {
      Linking.openURL(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`).catch(() => {});
    });
  };

  const handleTelegram = () => {
    triggerHaptic();
    Linking.openURL(`tg://msg?text=${encodeURIComponent(shareMessage)}`).catch(() => {
      Linking.openURL(`https://t.me/share/url?text=${encodeURIComponent(shareMessage)}`).catch(() => {});
    });
  };

  const handleTwitter = () => {
    triggerHaptic();
    Linking.openURL(`twitter://post?message=${encodeURIComponent(shareMessage)}`).catch(() => {
      Linking.openURL(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`).catch(() => {});
    });
  };

  const handleInstagram = () => {
    triggerHaptic();
    Linking.openURL('instagram://app').catch(() => {
      Linking.openURL('https://instagram.com').catch(() => {});
    });
  };

  const handleNativeShare = async () => {
    triggerHaptic();
    try {
      await Share.share({
        message: shareMessage,
        title: 'Join GT Network',
      });
    } catch (e) {
      // Share cancelled
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. WhatsApp */}
      <TouchableOpacity
        onPress={handleWhatsApp}
        style={[styles.socialButton, { backgroundColor: 'rgba(37, 211, 102, 0.12)' }]}
        activeOpacity={0.8}
        accessibilityLabel="Share on WhatsApp"
      >
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="#25D366">
          <Path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.476-.15-.677.15-.2.301-.776.978-.952 1.179-.175.2-.351.226-.652.075s-1.272-.469-2.424-1.496c-.896-.799-1.501-1.786-1.677-2.087-.175-.301-.019-.464.131-.614.136-.135.301-.351.451-.527.151-.175.201-.301.301-.501.101-.2.05-.376-.025-.527s-.677-1.63-928-2.232c-.244-.587-.492-.507-.677-.516-.175-.008-.376-.01-.576-.01s-.527.075-.802.376c-.276.301-1.053 1.028-1.053 2.508s1.078 2.909 1.229 3.11c.15.2 2.121 3.239 5.139 4.542.718.31 1.279.495 1.716.634.722.23 1.379.198 1.9.12.58-.088 1.78-.727 2.031-1.429.251-.702.251-1.304.175-1.429-.075-.125-.276-.2-.576-.351zM12.04 2C6.536 2 2.067 6.469 2.067 11.973c0 1.942.558 3.757 1.528 5.301L2 22l4.869-1.564c1.488.878 3.228 1.378 5.171 1.378 5.504 0 9.973-4.469 9.973-9.973 0-5.504-4.469-9.973-9.973-9.973z" />
        </Svg>
      </TouchableOpacity>

      {/* 2. Telegram */}
      <TouchableOpacity
        onPress={handleTelegram}
        style={[styles.socialButton, { backgroundColor: 'rgba(34, 158, 217, 0.12)' }]}
        activeOpacity={0.8}
        accessibilityLabel="Share on Telegram"
      >
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="#229ED9">
          <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
        </Svg>
      </TouchableOpacity>

      {/* 3. X (Twitter) */}
      <TouchableOpacity
        onPress={handleTwitter}
        style={[styles.socialButton, { backgroundColor: 'rgba(15, 20, 25, 0.08)' }]}
        activeOpacity={0.8}
        accessibilityLabel="Share on X"
      >
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="#0A341B">
          <Path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </Svg>
      </TouchableOpacity>

      {/* 4. Instagram */}
      <TouchableOpacity
        onPress={handleInstagram}
        style={[styles.socialButton, { backgroundColor: 'rgba(228, 64, 95, 0.12)' }]}
        activeOpacity={0.8}
        accessibilityLabel="Share on Instagram"
      >
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="#E4405F">
          <Path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </Svg>
      </TouchableOpacity>

      {/* 5. More Share */}
      <TouchableOpacity
        onPress={handleNativeShare}
        style={[styles.socialButton, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}
        activeOpacity={0.8}
        accessibilityLabel="More sharing options"
      >
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#0A341B" strokeWidth={2.4}>
          <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
        </Svg>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    gap: 8,
  },
  socialButton: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});

