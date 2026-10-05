# PAZ Shop mobile app

## Publishing over-the-air updates

EAS Update delivers JavaScript and bundled asset changes to installed builds
that have `expo-updates` enabled. Build and install the app at least once for
each channel before publishing OTA updates:

```sh
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform android --profile production
```

Install the resulting build for each channel on devices before publishing its
first OTA update.

After making and testing a JavaScript or asset change, publish it to the
appropriate channel:

```sh
npm run update:preview -- --message "Describe the preview update"
npm run update:production -- --message "Describe the production update"
```

The preview build subscribes to the `preview` channel; the production build
subscribes to `production`. Updates use the app's `appVersion` runtime policy,
so an update is delivered only to compatible installed builds. Increment the
app version and create a new native build when necessary to keep native and
JavaScript changes compatible.

OTA updates cover JavaScript and bundled assets only. Changes to native
dependencies, native code, or native app configuration require a new EAS
build and distribution; they cannot be delivered by an OTA update.
