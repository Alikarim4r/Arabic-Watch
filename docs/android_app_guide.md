# تطبيق أندرويد — Quran Story Universe

يُغلّف التطبيق الويب الحالي (`src/`) داخل **Capacitor** ليعمل كتطبيق أندرويد أصلي (WebView) مع بيانات محلية — بما فيها النص القرآني المستورد — دون إعادة كتابة الواجهة.

## المتطلبات على جهازك

| الأداة | الإصدار الموصى به |
|--------|-------------------|
| [Node.js](https://nodejs.org/) | 18+ |
| [Android Studio](https://developer.android.com/studio) | أحدث إصدار مستقر |
| JDK | 17 أو 21 (يأتي مع Android Studio) |
| Android SDK | API 36 (Android 16) |
| هاتف أندرويد أو محاكي | USB debugging مفعّل للهاتف |

## البنية

```
capacitor.config.json   إعدادات التطبيق (appId، webDir=src)
android/                مشروع Gradle الأصلي
src/                    نفس واجهة الويب — تُنسخ إلى APK عند sync
```

**معرّف التطبيق:** `com.quranstory.universe`

يستهدف المشروع Android 16 (API 36) ليتوافق مع متطلبات Google Play التي تبدأ في 31 أغسطس 2026.

## أوامر سريعة

```bash
# بعد أي تعديل على src/
npm run android:sync

# فتح المشروع في Android Studio
npm run android:open

# بناء APK تجريبي (debug)
npm run android:build
```

الملف الناتج:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

## تثبيت على هاتف متصل (USB)

1. فعّل **خيارات المطوّر** و**تصحيح USB** على الهاتف.
2. وصّل الهاتف وتحقق:

```bash
adb devices
```

3. ثبّت:

```bash
npm run android:install
```

أو يدويًا:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## من Android Studio

1. `npm run android:sync`
2. `npm run android:open`
3. اختر الهاتف أو المحاكي من القائمة العلوية.
4. اضغط **Run** (▶).

## ما يعمل داخل التطبيق

- الوضع المحلي (`local`) — البيانات و`quran_text.index.json` مضمّنة في APK
- المصحف `#mushaf` — نص عثماني مستورد (6236 آية) دون اتصال إنترنت
- Story Mode، البحث، المراجعة، إعدادات المصحف وإشاراته
- يتطلب إنترنت اختياريًا لخطوط Google وSupabase إن فُعّل لاحقًا

## قواعد المحتوى (لا تتغيّر)

- لا تعديل يدوي على `text_uthmani`
- لا استيراد تفسير عبر خط الأندرويد
- إخلاء المسؤولية العربي يبقى ظاهرًا
- بوابة `isFinalContent()` ومراجعة الأدلة كما في الويب

## استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| `ANDROID_HOME` غير معرّف | ثبّت Android Studio وعرّف SDK من **Settings → Android SDK** |
| شاشة بيضاء | نفّذ `npm run android:sync` ثم أعد البناء |
| `adb: not found` | أضف `platform-tools` إلى PATH من مجلد SDK |
| Gradle بطيء أول مرة | طبيعي — يحمّل الاعتماديات مرة واحدة |

## تحديث التطبيق بعد تعديل الكود

```bash
# عدّل ملفات src/ ثم:
npm run android:sync
npm run android:build
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## النشر (لاحقًا)

لبناء نسخة إصدار موقّعة (release):

```bash
cd android && ./gradlew bundleRelease
```

يتطلب keystore وإعداد `signingConfigs` في `android/app/build.gradle` — خارج نطاق هذا الدليل التجريبي.
