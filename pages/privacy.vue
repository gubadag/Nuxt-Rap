<template>
  <main class="privacy-page">
    <article class="card">
      <h1>TmRap RETRO — Privacy Policy</h1>

      <p class="muted">Last updated: October 13, 2025</p>

      <section>
        <h2>Introduction</h2>
        <p>
          TmRap RETRO ("we", "us", or "our") respects your privacy and is committed to protecting it.
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use
          the TmRap RETRO mobile application ("App") and the web version of TmRap RETRO ("Website").
          By using either version, you agree to the collection and use of information as described in this policy.
        </p>
      </section>

      <section>
        <h2>Information We Collect</h2>
        <ul>
          <li><strong>Device and usage data</strong> — device type, OS version, app version, language, and app usage statistics.</li>
          <li><strong>Network & performance data</strong> — network connection info, error/crash reports, and performance metrics.</li>
          <li><strong>Advertising identifiers</strong> — advertising IDs for ads served via Google AdMob (mobile) or cookies for Google AdSense (web).</li>
          <li><strong>Audio/Media</strong> — the app plays audio streams; we do not upload or analyze personal audio from your device.</li>
        </ul>
      </section>

      <section>
        <h2>How We Use Information</h2>
        <ul>
          <li>To provide and maintain the App and Website features and user experience.</li>
          <li>To serve personalized or non-personalized ads through our ad partners (e.g. Google AdMob and AdSense).</li>
          <li>To analyze usage and improve the App and Website via analytics services and crash reporting.</li>
          <li>To comply with legal obligations and protect our rights.</li>
        </ul>
      </section>

      <section>
        <h2>Third-Party Services</h2>
        <p>
          We use third-party services that may collect information about you depending on how you use our Service.
          These may include:
        </p>
        <ul>
          <li>
            <strong>Google AdMob</strong> — used in the mobile app to serve advertisements.
            AdMob may use your device’s advertising ID to provide personalized or non-personalized ads.
          </li>
          <li>
            <strong>Google AdSense</strong> — used on the web version of TmRap RETRO to display ads.
            AdSense may use cookies and similar technologies to deliver and measure ads.
          </li>
          <li>
            <strong>Firebase / Google Analytics</strong> — for analytics and crash reporting (if enabled).
          </li>
        </ul>
        <p>
          These third parties have their own privacy policies, which we encourage you to review:
        </p>
        <ul>
          <li><a href="https://policies.google.com/technologies/ads" target="_blank">Google Advertising Policies</a></li>
          <li><a href="https://policies.google.com/privacy" target="_blank">Google Privacy Policy</a></li>
        </ul>
      </section>

      <section>
        <h2>Ads and Advertising Identifiers</h2>
        <p>
          We display ads using Google AdMob (mobile) and Google AdSense (web).
          These services may collect device identifiers or use cookies to serve and measure ads.
          If you wish to opt out of personalized ads:
        </p>
        <ul>
          <li>For mobile: use your device settings to limit ad tracking.</li>
          <li>For web: visit <a href="https://adssettings.google.com" target="_blank">Google Ads Settings</a> to manage your preferences.</li>
        </ul>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          The App and Website are not intended for children under 13.
          We do not knowingly collect personal information from children under 13.
          If you believe we have collected such information, please contact us and we will remove it.
        </p>
      </section>

      <section>
        <h2>Data Retention & Security</h2>
        <p>
          We keep data only as long as necessary for the purposes described in this policy.
          We implement reasonable technical and organizational measures to protect your information,
          but no method of transmission or storage is completely secure.
        </p>
      </section>

      <section>
        <h2>Your Rights</h2>
        <p>
          Depending on your jurisdiction, you may have rights to access, correct, or delete your personal information.
          To exercise these rights, contact us at the email address below.
        </p>
      </section>

      <section>
        <h2>Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time.
          When we do, we will post the new version here with an updated "Last updated" date.
        </p>
      </section>




    </article>
  </main>
</template>

<script setup lang="ts">
// Static page — add localization or dynamic updates if needed later.
</script>

<style scoped>
.privacy-page {
  display: flex;
  justify-content: center;
  padding: 32px 16px;
  background: #f7f8fb;
  min-height: 100vh;
  box-sizing: border-box;
}

.card {
  max-width: 900px;
  background: #fff;
  padding: 28px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(16,24,40,0.06);
  color: #111827;
  line-height: 1.6;
}

h1 {
  margin: 0 0 6px;
  font-size: 28px;
}

.muted {
  color: #6b7280;
  margin-bottom: 18px;
}

h2 {
  margin-top: 20px;
  font-size: 18px;
  color: #111827;
}

ul {
  padding-left: 20px;
  margin: 8px 0;
}

.note {
  margin-top: 20px;
  font-size: 13px;
  color: #6b7280;
}
</style>
