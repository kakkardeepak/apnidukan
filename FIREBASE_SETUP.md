# Firebase setup

The website now uses Firebase Authentication. Complete these Console steps once after publishing the code.

1. Open the **Authentication** page of the `apni-dukan-c5a29` Firebase project.
2. In **Sign-in method**, enable **Email/Password**. Enable **Google** too if you want the Google button to work.
3. In **Users**, create the administrator with email `madaag1@admin.apnidukan.com`. Set the password you chose for the `Madaag1` account. This internal email is not displayed to shoppers; they sign in using the case-insensitive username `Madaag1`.
4. Open **Firestore Database → Rules**, replace the existing rules with the contents of `firestore.rules`, then publish.
5. In **Authentication → Settings → Authorized domains**, confirm that `madaag1.github.io` is listed for the live GitHub Pages site.

The legacy `config/adminCredentials` Firestore document is no longer used. It is intentionally denied by the new rules and should be deleted manually from Firestore after confirming the new admin login works.

Do not add passwords to the source code or to Firestore.
