const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Fixes fmt consteval compilation errors under Xcode 26 / Clang 18+.
 *
 * Two-pronged approach:
 *  1. Force C++17 on 'fmt' and 'glog' Pods targets — consteval requires C++20,
 *     so C++17 disables it entirely (FMT_USE_CONSTEVAL auto-resolves to 0).
 *  2. Glob every .h in the fmt pod and flip FMT_USE_CONSTEVAL 1→0 directly,
 *     as a belt-and-suspenders fallback in case build settings are ignored.
 */
const withFmtFix = (config) =>
  withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      let podfile = fs.readFileSync(podfilePath, 'utf8');

      if (podfile.includes('withFmtFix')) {
        return cfg;
      }

      const patch = `
  # withFmtFix: fmt consteval incompatibility with Xcode 26 / Clang 18+
  installer.pods_project.targets.each do |target|
    if ['fmt', 'glog'].include?(target.name)
      target.build_configurations.each do |build_config|
        # Force C++17: consteval is a C++20 feature; C++17 makes FMT_USE_CONSTEVAL=0 automatically
        build_config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
        existing_defs = build_config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'].to_s
        unless existing_defs.include?('FMT_USE_CONSTEVAL=0')
          build_config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = "$(inherited) FMT_USE_CONSTEVAL=0"
        end
      end
    end
  end

  # Also patch fmt headers directly (handles cases where build settings are overridden)
  pods_root = File.dirname(installer.pods_project.path)
  Dir.glob(File.join(pods_root, 'fmt/**/*.h')).each do |header|
    content = File.read(header)
    if content.include?('FMT_USE_CONSTEVAL') && content.match?(/define\\s+FMT_USE_CONSTEVAL\\s+1/)
      content.gsub!(/define\\s+FMT_USE_CONSTEVAL\\s+1/, 'define FMT_USE_CONSTEVAL 0')
      File.write(header, content)
      puts "[withFmtFix] Patched #{File.basename(header)}"
    end
  end
`;

      if (podfile.includes('post_install do |installer|')) {
        podfile = podfile.replace(
          'post_install do |installer|',
          `post_install do |installer|\n${patch}`
        );
      } else {
        podfile += `\npost_install do |installer|\n${patch}\nend\n`;
      }

      fs.writeFileSync(podfilePath, podfile);
      return cfg;
    },
  ]);

module.exports = withFmtFix;
