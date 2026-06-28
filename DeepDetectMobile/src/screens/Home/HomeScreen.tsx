import React, { useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS } from '../../constants/colors'
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
import ShareScreen from '../Share/ShareScreen'

type HomeScreenNavigationProp = StackNavigationProp<AppStackParamList, 'HomeScreen'>

type HomeScreenProps = {
  navigation: HomeScreenNavigationProp
}

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const theme = useTheme()
  const [selectedImage, setSelectedImage] = useState<Asset | null>(null)

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
        
        if (androidVersion >= 33) {
          // Android 13+
          const result = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES)
          return result === RESULTS.GRANTED
        } else {
          // Android 12 and below
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
    // Request permission first
    const hasPermission = await requestStoragePermission()
    
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant storage permission to upload images.',
        [{ text: 'OK' }]
      )
      return
    }

    // Launch image picker
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.white }]}>
      <StatusBar barStyle={theme.statusBar} backgroundColor={theme.white} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.divider }]}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="shield-check" size={32} color={theme.blueDark} />
            <Text style={[styles.appTitle, { color: theme.blueDark }]}>DeepDetect</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('SettingsScreen')}
            style={styles.settingsBtn}
          >
            <MaterialCommunityIcons name="cog-outline" size={26} color={theme.blueDark} />
          </TouchableOpacity>
        </View>

        {/* Selected Image Preview */}
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <View style={styles.imagePreviewFrame}>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.clearImageBtn}
                onPress={() => setSelectedImage(null)}
              >
                <MaterialCommunityIcons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.imageSelectedBadge}>
              <MaterialCommunityIcons name="check-circle" size={14} color={theme.greenMuted} />
              <Text style={[styles.imagePreviewText, { color: theme.greenMuted }]}>Image ready to analyze</Text>
            </View>
          </View>
        )}

        {/* Main Illustration */}
        {!selectedImage && (
          <View style={styles.illustrationContainer}>
            <Svg width="280" height="280" viewBox="0 0 200 200">
              <Defs>
                <SvgGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={theme.blueDark} stopOpacity="0.2" />
                  <Stop offset="100%" stopColor={theme.greenAccent} stopOpacity="0.2" />
                </SvgGradient>
              </Defs>
              
              <Circle cx="100" cy="100" r="90" fill="url(#grad1)" />
              
              <Path
                d="M60 70h80v60H60z"
                fill="none"
                stroke={theme.blueDark}
                strokeWidth="3"
                strokeLinecap="round"
              />
              
              <Path
                d="M70 120L85 100L100 115L125 85L130 95V120H70z"
                fill={theme.blueMedium}
                opacity="0.5"
              />
              
              <Circle cx="120" cy="85" r="8" fill={theme.greenAccent} />
              
              <G transform="translate(145, 50)">
                <Circle cx="0" cy="0" r="25" fill={theme.white} stroke={theme.blueDark} strokeWidth="2" />
                <Circle cx="-5" cy="-5" r="2" fill={theme.greenAccent} />
                <Circle cx="5" cy="-5" r="2" fill={theme.greenAccent} />
                <Circle cx="-5" cy="5" r="2" fill={theme.greenAccent} />
                <Circle cx="5" cy="5" r="2" fill={theme.greenAccent} />
                <Circle cx="0" cy="0" r="2" fill={theme.blueDark} />
                <Path
                  d="M-5 -5L0 0M5 -5L0 0M-5 5L0 0M5 5L0 0"
                  stroke={theme.blueMedium}
                  strokeWidth="1"
                />
              </G>
              
              <G transform="translate(50, 50)">
                <Circle cx="0" cy="0" r="18" fill={theme.greenAccent} />
                <Path
                  d="M-6 0L-2 4L6 -4"
                  fill="none"
                  stroke={theme.white}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </G>
            </Svg>
          </View>
        )}

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.textdark }]}>Welcome To DeepDetect</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            Upload any image and our advanced AI technology will analyze it to determine if it's AI-generated or real in seconds.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>

          {/* Capture */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleCaptureImage}
            activeOpacity={0.82}
          >
            <LinearGradient
              colors={[theme.blueDark, '#1B60A0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.iconBtnGrad}
            >
              <View style={styles.iconBtnCircle}>
                <MaterialCommunityIcons name="camera" size={22} color="#fff" />
              </View>
              <View style={styles.iconBtnLabels}>
                <Text style={styles.iconBtnTitle}>Capture Image</Text>
                <Text style={styles.iconBtnSub}>Take a photo with camera</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color="rgba(255,255,255,0.65)" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Upload */}
          <TouchableOpacity
            style={[styles.iconBtn, styles.iconBtnOuterGap]}
            onPress={handleUploadImage}
            activeOpacity={0.82}
          >
            <View style={[styles.iconBtnOutline, { borderColor: theme.blueDark, backgroundColor: theme.blueBackground }]}>
              <View style={[styles.iconBtnCircle, { backgroundColor: theme.blueSoft }]}>
                <MaterialCommunityIcons name="image-multiple-outline" size={22} color={theme.blueDark} />
              </View>
              <View style={styles.iconBtnLabels}>
                <Text style={[styles.iconBtnTitle, { color: theme.textdark }]}>
                  {selectedImage ? 'Upload Another' : 'Upload Image'}
                </Text>
                <Text style={[styles.iconBtnSub, { color: theme.textSecondary }]}>Select from gallery</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={theme.blueDark} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, styles.iconBtnOuterGap]}
            onPress={() => navigation.navigate('ShareScreen', { prediction: '', confidence: 0, imageUri: '' })}
            activeOpacity={0.82}
          >
            
          </TouchableOpacity>
           
        </View>

        {/* Analyze Button */}
        {selectedImage && (
          <View style={styles.analyzeSection}>
            <TouchableOpacity
              style={styles.analyzeBtn}
              activeOpacity={0.82}
              onPress={() =>
                navigation.navigate('AnalyzingScreen', {
                  imageUri: selectedImage.uri!,
                  fileName: selectedImage.fileName,
                  fileType: selectedImage.type,
                })
              }
            >
              <LinearGradient
                colors={[theme.greenAccent, theme.blueDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.analyzeBtnGrad}
              >
                <MaterialCommunityIcons name="line-scan" size={24} color="#fff" />
                <Text style={styles.analyzeBtnText}>Analyze Image</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* How It Works Section */}
        {/* <View style={styles.howItWorksContainer}>
          <Text style={[styles.sectionTitle, { color: theme.textdark }]}>How It Works</Text>

          <View style={styles.stepRow}>
            {[
              { icon: 'camera-plus-outline', bg: theme.blueSoft,        iconColor: theme.blueDark,  num: '1', title: 'Pick Image',   desc: 'Capture or upload' },
              { icon: 'brain',               bg: theme.greenBackground, iconColor: theme.greenMuted, num: '2', title: 'AI Scans',    desc: 'Deep analysis'     },
              { icon: 'check-decagram',      bg: theme.blueSoft,        iconColor: theme.blueDark,  num: '3', title: 'Get Result',  desc: 'Real or AI?'       },
            ].map((step, idx, arr) => (
              <React.Fragment key={step.num}>
                <View style={[styles.stepCard, { backgroundColor: theme.whiteSoft, borderColor: theme.divider }]}>
                  <View style={[styles.stepIconBg, { backgroundColor: step.bg }]}>
                    <MaterialCommunityIcons name={step.icon} size={24} color={step.iconColor} />
                  </View>
                  <View style={[styles.stepNumBadge, { backgroundColor: theme.blueDark }]}>
                    <Text style={styles.stepNumText}>{step.num}</Text>
                  </View>
                  <Text style={[styles.stepTitle, { color: theme.textdark }]}>{step.title}</Text>
                  <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>{step.desc}</Text>
                </View>
                {idx < arr.length - 1 && (
                  <MaterialCommunityIcons name="chevron-right" size={18} color={theme.divider} style={styles.stepArrow} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View> */}

      </ScrollView>
    </SafeAreaView>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 15,
    fontFamily: FONTFAMILY.VivitaMedium,
    fontSize: 16,
    color: '#FFFFFF',
  },
  scrollContent: { paddingBottom: 30 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    marginBottom: 6,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appTitle: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 24,
  },
  settingsBtn: { padding: 4 },
  imagePreviewContainer: {
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  imagePreviewFrame: {
    position: 'relative',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  imagePreview: {
    width: 300,
    height: 300,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#96F6AE',
  },
  clearImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageSelectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  imagePreviewText: {
    fontFamily: FONTFAMILY.VivitaMedium,
    fontSize: 14,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  content: {
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 36,
  },
  description: {
    fontFamily: FONTFAMILY.VivitaLight,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  // ── Action buttons ────────────────────────────────────────────────────
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  iconBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#1B60A0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  iconBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 18,
    gap: 14,
  },
  iconBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 14,
  },
  iconBtnOuterGap: { marginTop: 12 },
  iconBtnCircle: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnLabels: { flex: 1 },
  iconBtnTitle: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 15,
    color: '#fff',
    marginBottom: 2,
  },
  iconBtnSub: {
    fontFamily: FONTFAMILY.VivitaLight,
    fontSize: 12,
    color: 'rgba(255,255,255,0.72)',
  },
  // ── Analyze button ────────────────────────────────────────────────────
  analyzeSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  analyzeBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#2A7BB6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 8,
  },
  analyzeBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 18,
    gap: 10,
  },
  analyzeBtnText: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 17,
    color: '#fff',
    letterSpacing: 0.3,
  },
  howItWorksContainer: { paddingHorizontal: 20 },
  sectionTitle: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  stepArrow: { marginBottom: 20 },
  stepIconBg: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepNumBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepNumText: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 11,
    color: '#fff',
  },
  stepTitle: {
    fontFamily: FONTFAMILY.VivitaBold,
    fontSize: 13,
    marginBottom: 4,
    textAlign: 'center',
  },
  stepDescription: {
    fontFamily: FONTFAMILY.VivitaLight,
    fontSize: 11,
    textAlign: 'center',
  },
})