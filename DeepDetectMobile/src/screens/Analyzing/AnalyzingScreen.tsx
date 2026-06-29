import React, { useEffect, useRef } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import LinearGradient from 'react-native-linear-gradient'
import Svg, { Circle } from 'react-native-svg'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { AppStackParamList } from '../../route/AppNavigator'
import { DetectAIImage } from '../../services/newapi'
import { FONTFAMILY } from '../../constants/fontFamily'
import { useTheme } from '../../hooks/useTheme'
import { uploadImageToCloudinary } from '../../services/cloudinary'
import { saveHistory } from '../../services/firestore'
import { getCurrentUID } from '../../services/auth'

const { width: SW, height: SH } = Dimensions.get('window')
const ORB_SIZE = 210
const ORB_HALF = ORB_SIZE / 2

type Props = {
  route: RouteProp<AppStackParamList, 'AnalyzingScreen'>
  navigation: StackNavigationProp<AppStackParamList, 'AnalyzingScreen'>
}

const INNER_PARTICLES = [
  { id: 1, x: 0.22, y: 0.30, size: 3, dur: 3000, delay: 0 },
  { id: 2, x: 0.72, y: 0.20, size: 2, dur: 4000, delay: 500 },
  { id: 3, x: 0.50, y: 0.68, size: 4, dur: 3500, delay: 1000 },
  { id: 4, x: 0.78, y: 0.55, size: 2, dur: 2800, delay: 200 },
  { id: 5, x: 0.18, y: 0.62, size: 3, dur: 3200, delay: 700 },
  { id: 6, x: 0.62, y: 0.38, size: 2, dur: 4200, delay: 1500 },
  { id: 7, x: 0.32, y: 0.48, size: 3, dur: 3800, delay: 300 },
  { id: 8, x: 0.88, y: 0.32, size: 2, dur: 3000, delay: 900 },
]

const BG_DOTS = [
  { id: 1, x: 0.08, y: 0.14, size: 5, dur: 5000 },
  { id: 2, x: 0.88, y: 0.10, size: 4, dur: 5800 },
  { id: 3, x: 0.45, y: 0.06, size: 6, dur: 6200 },
  { id: 4, x: 0.18, y: 0.82, size: 4, dur: 4800 },
  { id: 5, x: 0.78, y: 0.78, size: 5, dur: 6500 },
  { id: 6, x: 0.96, y: 0.48, size: 3, dur: 5200 },
  { id: 7, x: 0.03, y: 0.52, size: 4, dur: 5600 },
  { id: 8, x: 0.55, y: 0.92, size: 3, dur: 4600 },
]

const AnalyzingScreen = ({ route, navigation }: Props) => {
  const { imageUri, fileName, fileType } = route.params
  const theme = useTheme()

  // --- animation refs ---
  const fadeIn    = useRef(new Animated.Value(0)).current
  const scaleIn   = useRef(new Animated.Value(0.88)).current
  const rotate1   = useRef(new Animated.Value(0)).current  // outer ring  CW fast
  const rotate2   = useRef(new Animated.Value(0)).current  // mid ring    CCW
  const rotate3   = useRef(new Animated.Value(0)).current  // inner ring  CW slow
  const pulse     = useRef(new Animated.Value(1)).current
  const glow      = useRef(new Animated.Value(0)).current
  const textFade  = useRef(new Animated.Value(1)).current
  const shimmer   = useRef(new Animated.Value(-1)).current
  const scanLine  = useRef(new Animated.Value(0)).current  // vertical scanning laser
  const particleAnims = useRef(INNER_PARTICLES.map(() => new Animated.Value(0))).current
  const bgDotAnims    = useRef(BG_DOTS.map(() => new Animated.Value(0))).current

  // Neon particle color palette for synthwave bursts
  const PARTICLE_COLORS = [theme.greenAccent, theme.blueMedium, theme.red, theme.bluePrimary, theme.greenLight, theme.blueLight, theme.lightred, theme.blueMedium]

  useEffect(() => {
    // ── Entry ─────────────────────────────────────────────────────────────
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }),
      Animated.spring(scaleIn, {
        toValue: 1, tension: 55, friction: 9, useNativeDriver: true,
      }),
    ]).start()

    // ── Ring rotations (sped up for ultra-responsive feel) ─────────────────
    Animated.loop(
      Animated.timing(rotate1, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true })
    ).start()
    Animated.loop(
      Animated.timing(rotate2, { toValue: 1, duration: 7000, easing: Easing.linear, useNativeDriver: true })
    ).start()
    Animated.loop(
      Animated.timing(rotate3, { toValue: 1, duration: 12000, easing: Easing.linear, useNativeDriver: true })
    ).start()

    // ── Orb pulse ─────────────────────────────────────────────────────────
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.055, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1,     duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start()

    // ── Glow intensity ────────────────────────────────────────────────────
    Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start()

    // ── Text fade ─────────────────────────────────────────────────────────
    Animated.loop(Animated.sequence([
      Animated.timing(textFade, { toValue: 0.55, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(textFade, { toValue: 1,    duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start()

    // ── Shimmer sweep ─────────────────────────────────────────────────────
    Animated.loop(
      Animated.timing(shimmer, { toValue: 2, duration: 2200, easing: Easing.linear, useNativeDriver: true })
    ).start()

    // ── Vertical scanning laser line ──────────────────────────────────────
    Animated.loop(
      Animated.timing(scanLine, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true })
    ).start()

    // ── Inner particles ───────────────────────────────────────────────────
    INNER_PARTICLES.forEach((p, i) => {
      const loop = () => {
        Animated.sequence([
          Animated.delay(p.delay),
          Animated.timing(particleAnims[i], { toValue: 1, duration: p.dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(particleAnims[i], { toValue: 0, duration: p.dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]).start(({ finished }) => { if (finished) loop() })
      }
      loop()
    })

    // ── Background drifting dots ──────────────────────────────────────────
    BG_DOTS.forEach((dot, i) => {
      const loop = () => {
        Animated.sequence([
          Animated.delay(i * 380),
          Animated.timing(bgDotAnims[i], { toValue: 1, duration: dot.dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(bgDotAnims[i], { toValue: 0, duration: dot.dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]).start(({ finished }) => { if (finished) loop() })
      }
      loop()
    })

    // ── API call ──────────────────────────────────────────────────────────
    callAPI()
  }, [])

  const callAPI = async () => {
    try {
      const result = await DetectAIImage({
        uri: imageUri,
        fileName: fileName ?? undefined,
        type: fileType ?? undefined,
      })

      // ── Upload to Cloudinary + save to Firestore (non-blocking) ──────────
      let cloudinaryUrl = imageUri // fallback to local URI
      try {
        const uploaded = await uploadImageToCloudinary({
          uri: imageUri,
          fileName: fileName ?? 'image.jpg',
          type: fileType ?? 'image/jpeg',
        } as any)
        cloudinaryUrl = uploaded.secure_url
        console.log('[Cloudinary] Uploaded:', cloudinaryUrl)

        const uid = getCurrentUID()
        if (uid) {
          await saveHistory(uid, {
            imageUrl: cloudinaryUrl,
            publicId: uploaded.public_id,
            prediction: result.prediction,
            confidence: result.confidence,
          })
          console.log('[Firestore] History saved')
        }
      } catch (uploadErr) {
        // Upload/save failure should not block the result screen
        console.warn('[AnalyzingScreen] Upload/save error (non-fatal):', uploadErr)
      }

      navigation.replace('ResultScreen', { imageUri: cloudinaryUrl, result })
    } catch (error: any) {
      Alert.alert(
        'Analysis Failed',
        error.message || 'Could not analyze image. Please try again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      )
    }
  }

  // ── Interpolations ─────────────────────────────────────────────────────
  const r1 = rotate1.interpolate({ inputRange: [0, 1], outputRange: ['0deg',   '360deg'] })
  const r2 = rotate2.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg']   })
  const r3 = rotate3.interpolate({ inputRange: [0, 1], outputRange: ['0deg',   '360deg'] })
  const shimmerX   = shimmer.interpolate({ inputRange: [-1, 2], outputRange: [-ORB_SIZE, ORB_SIZE] })
  const halo3Op    = glow.interpolate({ inputRange: [0, 1], outputRange: [0.06, 0.22] })
  const halo2Op    = glow.interpolate({ inputRange: [0, 1], outputRange: [0.11, 0.28] })
  const halo1Op    = glow.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.18] })

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.white }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.white} translucent />

      <LinearGradient
        colors={[theme.white, theme.whitePure, theme.white, theme.whiteSoft]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bg}
      >
        {/* ── Background drifting dots ───────────────────────────────────── */}
        {BG_DOTS.map((dot, i) => {
          const ty = bgDotAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0, -20] })
          const op = bgDotAnims[i].interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.10, 0.35, 0.10] })
          return (
            <Animated.View
              key={dot.id}
              style={[
                styles.bgDot,
                {
                  width: dot.size, height: dot.size, borderRadius: dot.size / 2,
                  left: dot.x * SW, top: dot.y * SH,
                  opacity: op, transform: [{ translateY: ty }],
                  backgroundColor: theme.blueDark,
                },
              ]}
            />
          )
        })}

        {/* ── Header ────────────────────────────────────────────────────── */}
        <View style={[styles.header, { borderBottomColor: theme.divider }]}>
       
          <Text style={[styles.hTitle, { color: theme.textdark }]}>Deep Detect</Text>
         
        </View>

        {/* ── Main content ──────────────────────────────────────────────── */}
        <Animated.View style={[styles.content, { opacity: fadeIn, transform: [{ scale: scaleIn }] }]}>

          {/* Orb container */}
          <View style={styles.orbWrap}>

            {/* Pulsing glow halos */}
            <Animated.View style={[styles.halo, styles.halo3, { opacity: halo3Op }]} />
            <Animated.View style={[styles.halo, styles.halo2, { opacity: halo2Op }]} />
            <Animated.View style={[styles.halo, styles.halo1, { opacity: halo1Op }]} />

            {/* Ring 1 – outer dashed, 3D tilted holographic disk */}
            <Animated.View style={[styles.ringAbs, { width: 270, height: 270, transform: [{ perspective: 450 }, { rotateX: '60deg' }, { rotateY: '8deg' }, { rotateZ: r1 }] }]}>
              <Svg width={270} height={270} viewBox="0 0 270 270">
                <Circle
                  cx="135" cy="135" r="131"
                  fill="none" stroke={theme.blueMedium}
                  strokeWidth="1.8" strokeDasharray="12 8"
                  strokeLinecap="round" opacity={0.65}
                />
              </Svg>
            </Animated.View>

            {/* Ring 2 – mid dashed, 3D tilted CCW */}
            <Animated.View style={[styles.ringAbs, { width: 248, height: 248, transform: [{ perspective: 450 }, { rotateX: '60deg' }, { rotateY: '-8deg' }, { rotateZ: r2 }] }]}>
              <Svg width={248} height={248} viewBox="0 0 248 248">
                <Circle
                  cx="124" cy="124" r="119"
                  fill="none" stroke={theme.greenPrimary}
                  strokeWidth="1.5" strokeDasharray="6 12"
                  strokeLinecap="round" opacity={0.75}
                />
              </Svg>
            </Animated.View>

            {/* Ring 3 – inner dotted, 3D tilted CW slow */}
            <Animated.View style={[styles.ringAbs, { width: 224, height: 224, transform: [{ perspective: 450 }, { rotateX: '60deg' }, { rotateY: '0deg' }, { rotateZ: r3 }] }]}>
              <Svg width={224} height={224} viewBox="0 0 224 224">
                <Circle
                  cx="112" cy="112" r="107"
                  fill="none" stroke={theme.blueLight}
                  strokeWidth="1.2" strokeDasharray="4 14"
                  strokeLinecap="round" opacity={0.55}
                />
              </Svg>
            </Animated.View>

            {/* Orb core */}
            <Animated.View style={[styles.orbCore, { transform: [{ scale: pulse }] }]}>
              <LinearGradient
                colors={[theme.blueLight, theme.blueMedium, theme.blueDark, theme.blueSoft]}
                start={{ x: 0.1, y: 0.05 }}
                end={{ x: 0.9, y: 0.95 }}
                style={styles.orbGrad}
              >
                {/* Inner ambient border ring */}
                <View style={styles.orbInnerRing} />

                {/* Shimmer light sweep */}
                <Animated.View
                  style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]}
                />

                {/* Glass highlight sheen */}
                <View style={styles.glassSheen} />

                {/* Neon burst particles */}
                {INNER_PARTICLES.map((p, i) => {
                  const ty = particleAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0, -14] })
                  const op = particleAnims[i].interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.15, 1, 0.15] })
                  return (
                    <Animated.View
                      key={p.id}
                      style={{
                        position: 'absolute',
                        width: p.size + 1, height: p.size + 1, borderRadius: (p.size + 1) / 2,
                        backgroundColor: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
                        left: p.x * ORB_SIZE - p.size / 2,
                        top:  p.y * ORB_SIZE - p.size / 2,
                        opacity: op,
                        transform: [{ translateY: ty }],
                      }}
                    />
                  )
                })}

                {/* Vertical scanning laser line */}
                <Animated.View
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: 2,
                    backgroundColor: theme.greenAccent,
                    opacity: 0.7,
                    top: 0,
                    transform: [{ translateY: scanLine.interpolate({ inputRange: [0, 1], outputRange: [0, ORB_SIZE] }) }],
                  }}
                />

                {/* Centre scan icon */}
                <View style={styles.centerIcon}>
                  <MaterialCommunityIcons name="line-scan" size={56} color="rgba(255,255,255,0.96)" />
                </View>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* "Analyzing…" label */}
          <Animated.Text style={[styles.label, { color: theme.textdark, opacity: textFade }]}>
            Analyzing your image...
          </Animated.Text>

          {/* Pulsing dots */}
          <View style={styles.dotsRow}>
            {[0, 1, 2].map(i => {
              const dotOp = textFade.interpolate({
                inputRange: [0.55, 1],
                outputRange: i === 1 ? [1, 0.45] : [0.3, 1],
              })
              return (
                <Animated.View key={i} style={[styles.dot, { opacity: dotOp }]} />
              )
            })}
          </View>

          {/* Secure badge */}
          <View style={[styles.lockBadge, { backgroundColor: theme.blueDark + '18', borderColor: theme.blueDark + '28' }]}>
            <MaterialCommunityIcons name="lock-outline" size={13} color={theme.blueDark} />
            <Text style={[styles.lockText, { color: theme.blueDark }]}>Secure AI Processing</Text>
          </View>

        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  )
}

export default AnalyzingScreen

const styles = StyleSheet.create({
  safe: { flex: 1 },
  bg:   { flex: 1 },

  bgDot: { position: 'absolute' },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(42,123,182,0.15)',
  },
  hBtn:  { padding: 6 },
  hTitle: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 20,
    color: '#323345',
    letterSpacing: 0.4,
  },

  // ── Content ──────────────────────────────────────────────────────────────
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },

  // ── Orb ──────────────────────────────────────────────────────────────────
  orbWrap: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 44,
  },

  // Glow halos
  halo: { position: 'absolute', backgroundColor: 'rgba(42,123,182,1)' },
  halo3: { width: 284, height: 284, borderRadius: 142 },
  halo2: { width: 254, height: 254, borderRadius: 127 },
  halo1: { width: 230, height: 230, borderRadius: 115 },

  // Rotating ring wrappers
  ringAbs: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Core orb
  orbCore: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_HALF,
    overflow: 'hidden',
    elevation: 22,
    shadowColor: '#1B60A0',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 28,
  },
  orbGrad: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_HALF,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orbInnerRing: {
    position: 'absolute',
    width: ORB_SIZE - 18,
    height: ORB_SIZE - 18,
    borderRadius: (ORB_SIZE - 18) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  shimmer: {
    position: 'absolute',
    width: 50,
    height: ORB_SIZE * 1.6,
    backgroundColor: 'rgba(255,255,255,0.09)',
    top: -ORB_SIZE * 0.3,
    transform: [{ rotate: '-18deg' }],
  },
  glassSheen: {
    position: 'absolute',
    top: 16,
    left: 22,
    width: 66,
    height: 28,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    transform: [{ rotate: '-18deg' }],
  },
  centerIcon: { alignItems: 'center', justifyContent: 'center' },

  // ── Labels ────────────────────────────────────────────────────────────────
  label: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 20,
    color: '#323345',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginBottom: 16,
  },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 32 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#2A7BB6',
  },

  // ── Lock badge ───────────────────────────────────────────────────────────
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(42,123,182,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(42,123,182,0.18)',
  },
  lockText: {
    fontFamily: FONTFAMILY.VivitaMedium,
    fontSize: 12,
    color: '#2A7BB6',
    letterSpacing: 0.3,
  },
})
