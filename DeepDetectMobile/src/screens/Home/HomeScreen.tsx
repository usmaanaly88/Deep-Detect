import React, { useState, useEffect, useRef } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  Alert,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FONTFAMILY } from '../../constants/fontFamily'
import { StackNavigationProp } from '@react-navigation/stack'
import { AppStackParamList } from '../../route/AppNavigator'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import LinearGradient from 'react-native-linear-gradient'
import Svg, { Path, Circle, G, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg'
import { launchImageLibrary, launchCamera, ImagePickerResponse, Asset } from 'react-native-image-picker'
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions'
import { Platform } from 'react-native'
import { useTheme } from '../../hooks/useTheme'

type HomeScreenNavigationProp = StackNavigationProp<AppStackParamList, 'HomeScreen'>

type HomeScreenProps = {
  navigation: HomeScreenNavigationProp
}

const { width } = Dimensions.get('window')

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const theme = useTheme()
  const [selectedImage, setSelectedImage] = useState<Asset | null>(null)

  // Animated values for premium micro-interactions
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const imageScale = useRef(new Animated.Value(0.9)).current
  
  // 3D Parallax Tilt animations for action cards
  const tiltX = useRef(new Animated.Value(0)).current
  const tiltY = useRef(new Animated.Value(0)).current
  
  // 3D Illustration rotation
  const rotateIllustration = useRef(new Animated.Value(0)).current

  // Scale spring animation for scan button
  const scaleButton = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Mount animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()

    // 3D Illustration continuous rotation
    const illustrationAnim = Animated.loop(
      Animated.timing(rotateIllustration, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )

    // Idle 3D Card Parallax Sway
    const idleParallax = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(tiltX, { toValue: 4, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(tiltY, { toValue: -4, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(tiltX, { toValue: -4, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(tiltY, { toValue: 4, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ])
    )

    // Start loops on mount
    illustrationAnim.start()
    idleParallax.start()

    // Pause loops when screen loses focus to ensure zero background CPU usage
    const unsubscribeFocus = navigation.addListener('focus', () => {
      illustrationAnim.start()
      idleParallax.start()
    })

    const unsubscribeBlur = navigation.addListener('blur', () => {
      illustrationAnim.stop()
      idleParallax.stop()
    })

    return () => {
      unsubscribeFocus()
      unsubscribeBlur()
      illustrationAnim.stop()
      idleParallax.stop()
    }
  }, [])

  useEffect(() => {
    if (selectedImage) {
      Animated.spring(imageScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start()
    } else {
      imageScale.setValue(0.9)
    }
  }, [selectedImage])

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const result = await request(PERMISSIONS.ANDROID.CAMERA)
        return result === RESULTS.GRANTED
      } else {
        const result = await request(PERMISSIONS.IOS.CAMERA)
        return result === RESULTS.GRANTED
      }
    } catch (error) {
      console.log('Camera permission error:', error)
      return false
    }
  }

  const requestStoragePermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const androidVersion = Platform.Version
        if (Number(androidVersion) >= 33) {
          const result = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES)
          return result === RESULTS.GRANTED
        } else {
          const result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE)
          return result === RESULTS.GRANTED
        }
      }
      return true
    } catch (error) {
      console.log('Permission error:', error)
      return false
    }
  }

  const handleCaptureImage = async () => {
    const hasPermission = await requestCameraPermission()

    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant camera permission to capture images.',
        [{ text: 'OK' }]
      )
      return
    }

    launchCamera(
      {
        mediaType: 'photo',
        quality: 1,
        saveToPhotos: false,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log('User cancelled camera')
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Failed to capture image')
        } else if (response.assets && response.assets.length > 0) {
          const image = response.assets[0]
          setSelectedImage(image)
        }
      }
    )
  }

  const handleUploadImage = async () => {
    const hasPermission = await requestStoragePermission()

    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant storage permission to upload images.',
        [{ text: 'OK' }]
      )
      return
    }

    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
        selectionLimit: 1,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log('User cancelled image picker')
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Failed to pick image')
        } else if (response.assets && response.assets.length > 0) {
          const image = response.assets[0]
          setSelectedImage(image)
        }
      }
    )
  }

  const handleScanPress = () => {
    Animated.sequence([
      Animated.timing(scaleButton, { toValue: 0.92, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleButton, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
    ]).start(() => {
      navigation.navigate('AnalyzingScreen', {
        imageUri: selectedImage!.uri!,
        fileName: selectedImage!.fileName,
        fileType: selectedImage!.type,
      })
    })
  }

  const rotIllustrate = rotateIllustration.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  // Card 3D Tilt transforms
  const rotateCardX = tiltX.interpolate({
    inputRange: [-10, 10],
    outputRange: ['-6deg', '6deg'],
  })

  const rotateCardY = tiltY.interpolate({
    inputRange: [-10, 10],
    outputRange: ['-6deg', '6deg'],
  })

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.white }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.white} />

      {/* Sleek Glassmorphic Header */}
      <View style={[styles.header, { borderBottomColor: theme.divider, backgroundColor: theme.whiteSoft }]}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoIconBg, { backgroundColor: theme.blueSurface }]}>
            <MaterialCommunityIcons name="shield-lock-open" size={22} color={theme.blueMedium} />
          </View>
          <Text style={[styles.appTitle, { color: theme.textdark }]}>DeepDetect</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('SettingsScreen')}
          style={[styles.settingsBtn, { backgroundColor: theme.graySurface }]}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="cog" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          {/* Selected Image Preview Container */}
          {selectedImage && (
            <Animated.View style={[styles.imagePreviewContainer, { transform: [{ scale: imageScale }] }]}>
              <View style={[styles.imagePreviewFrame, { borderColor: theme.border, backgroundColor: theme.whiteSoft }]}>
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.clearImageBtn}
                  onPress={() => setSelectedImage(null)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={[styles.imageSelectedBadge, { backgroundColor: theme.greenBackground }]}>
                <MaterialCommunityIcons name="check-circle" size={14} color={theme.greenPrimary} />
                <Text style={[styles.imagePreviewText, { color: theme.greenPrimary }]}>Image ready to analyze</Text>
              </View>
            </Animated.View>
          )}

          {/* Main Clean Tech Illustration with 3D Y-Axis rotation */}
          {!selectedImage && (
            <View style={styles.illustrationContainer}>
              <View style={[styles.glowCircle, { backgroundColor: theme.blueMedium, opacity: 0.08 }]} />
              <Animated.View style={{ transform: [{ perspective: 350 }, { rotateY: rotIllustrate }] }}>
                <Svg width="220" height="220" viewBox="0 0 200 200">
                  <Defs>
                    <SvgGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor={theme.blueDark} stopOpacity="0.3" />
                      <Stop offset="100%" stopColor={theme.blueMedium} stopOpacity="0.05" />
                    </SvgGradient>
                  </Defs>
                  <Circle cx="100" cy="100" r="85" fill="url(#grad1)" stroke={theme.blueMedium} strokeWidth="1.5" strokeDasharray="6,6" opacity="0.6" />
                  <Circle cx="100" cy="100" r="60" fill="none" stroke={theme.bluePrimary} strokeWidth="1" opacity="0.25" />
                  
                  {/* Tech target reticle */}
                  <Path d="M100 20 V40 M100 160 V180 M20 100 H40 M160 100 H180" stroke={theme.blueMedium} strokeWidth="2.5" opacity="0.6" />
                  
                  {/* Floating nodes representing deepfake detection nodes */}
                  <Circle cx="70" cy="65" r="5.5" fill={theme.blueMedium} />
                  <Circle cx="140" cy="80" r="4.5" fill={theme.blueDark} />
                  <Circle cx="80" cy="135" r="6.5" fill={theme.greenPrimary} />
                  <Circle cx="130" cy="130" r="5.5" fill={theme.red} />
                  
                  {/* Interconnecting data pathways */}
                  <Path d="M70 65 L100 100 L140 80 M100 100 L80 135 M100 100 L130 130" stroke={theme.blueSoft} strokeWidth="1" strokeDasharray="3,3" />
                  
                  {/* Main Scanning Brain/Shield Hub */}
                  <G transform="translate(82, 82)">
                    <Path
                      d="M18 2 L2 9 V22 C2 32 8 40 18 44 C28 40 34 32 34 22 V9 L18 2 Z"
                      fill={theme.whiteSoft}
                      stroke={theme.blueDark}
                      strokeWidth="3.5"
                    />
                    <Path
                      d="M18 10 V36 M10 18 H26 M13 28 H23"
                      stroke={theme.blueMedium}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.85"
                    />
                  </G>
                </Svg>
              </Animated.View>
            </View>
          )}

          {/* Premium Welcome Content */}
          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.textdark }]}>Check Image Authenticity</Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              Check if an image is real or deep-fake. Your images are kept private and processed in seconds.
            </Text>
          </View>

          {/* Premium Interactive 3D Parallax Action Cards */}
          <View style={styles.actionSection}>
            {/* Capture Button */}
            <Animated.View style={[styles.actionCard, { transform: [{ perspective: 400 }, { rotateX: rotateCardX }, { rotateY: rotateCardY }] }]}>
              <TouchableOpacity
                onPress={handleCaptureImage}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[theme.blueDark, theme.bluePrimary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardIconContainer}>
                    <MaterialCommunityIcons name="camera-plus" size={24} color="#fff" />
                  </View>
                  <View style={styles.cardTextContainer}>
                    <Text style={styles.cardTitle}>Take a Picture</Text>
                    <Text style={styles.cardSubtitle}>Use your camera to take a photo</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.7)" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Gallery Upload Button */}
            <Animated.View style={[styles.actionCard, { marginTop: 14, transform: [{ perspective: 400 }, { rotateX: rotateCardX }, { rotateY: rotateCardY }] }]}>
              <TouchableOpacity
                onPress={handleUploadImage}
                activeOpacity={0.9}
              >
                <View style={[styles.cardOutline, { borderColor: theme.border, backgroundColor: theme.whiteSoft }]}>
                  <View style={[styles.cardIconContainer, { backgroundColor: theme.blueSurface }]}>
                    <MaterialCommunityIcons name="image-multiple" size={24} color={theme.blueMedium} />
                  </View>
                  <View style={styles.cardTextContainer}>
                    <Text style={[styles.cardTitleOutlined, { color: theme.textdark }]}>
                      {selectedImage ? 'Choose Different Image' : 'Select from Library'}
                    </Text>
                    <Text style={[styles.cardSubtitleOutlined, { color: theme.textSecondary }]}>Import image from device storage</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={theme.blueMedium} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Sleek Floating Scan Action Button */}
          {selectedImage && (
            <Animated.View style={[styles.analyzeSection, { transform: [{ scale: scaleButton }] }]}>
              <TouchableOpacity
                style={styles.analyzeBtn}
                activeOpacity={0.9}
                onPress={handleScanPress}
              >
                <LinearGradient
                  colors={[theme.greenAccent, theme.greenMuted]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.analyzeBtnGrad}
                >
                  <MaterialCommunityIcons name="shield-search" size={22} color="#fff" />
                  <Text style={styles.analyzeBtnText}>Check Image</Text>
                  <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 20,
    letterSpacing: 0.5,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginVertical: 24,
    paddingHorizontal: 20,
  },
  imagePreviewFrame: {
    position: 'relative',
    borderRadius: 24,
    borderWidth: 1,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  imagePreview: {
    width: width - 80,
    height: width - 80,
    borderRadius: 18,
  },
  clearImageBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageSelectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  imagePreviewText: {
    fontFamily: FONTFAMILY.VivitaMedium,
    fontSize: 13,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    position: 'relative',
  },
  glowCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  content: {
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  description: {
    fontFamily: FONTFAMILY.VivitaLight,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 14,
  },
  cardOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 14,
  },
  cardIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextContainer: { flex: 1 },
  cardTitle: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 15,
    color: '#fff',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: FONTFAMILY.VivitaLight,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  cardTitleOutlined: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 15,
    marginBottom: 2,
  },
  cardSubtitleOutlined: {
    fontFamily: FONTFAMILY.VivitaLight,
    fontSize: 12,
  },
  analyzeSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  analyzeBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  analyzeBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  analyzeBtnText: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 16,
    color: '#fff',
    letterSpacing: 0.5,
  },
})