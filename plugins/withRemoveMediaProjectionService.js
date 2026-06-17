const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Removes react-native-webrtc's MediaProjectionService from the Android manifest.
 *
 * The service declares foregroundServiceType="mediaProjection" which Android 15 (API 35)
 * forbids from being started by BOOT_COMPLETED broadcast receivers. Since this app uses
 * WebRTC only for camera/microphone calls (not screen capture), the service is unnecessary
 * and its presence triggers a Play Store policy warning / crash on Android 15 devices.
 *
 * See: https://developer.android.com/about/versions/15/behavior-changes-15#fgs-boot-completed
 */
const withRemoveMediaProjectionService = (config) =>
  withAndroidManifest(config, (mod) => {
    const application = mod.modResults.manifest.application?.[0];
    if (!application) return mod;

    const services = application.service ?? [];
    application.service = services.filter(
      (service) =>
        service.$?.['android:name'] !== 'com.oney.WebRTCModule.MediaProjectionService'
    );

    return mod;
  });

module.exports = withRemoveMediaProjectionService;
