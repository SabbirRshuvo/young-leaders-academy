const fs = require('fs');

function refactorLogin() {
    const filePath = './app/[locale]/login/page.tsx';
    let content = fs.readFileSync(filePath, 'utf8');

    // Add imports
    if (!content.includes('next-intl')) {
        content = content.replace(
            'import { useRouter } from "next/navigation";',
            'import { useRouter } from "next/navigation";\nimport { useTranslations, useLocale } from "next-intl";'
        );
    }

    // Add hooks
    content = content.replace(
        'const router = useRouter();',
        'const router = useRouter();\n    const t = useTranslations("Auth");\n    const locale = useLocale();'
    );

    // Replace router.push hardcoded "/en/"
    content = content.replace(/\/en\/forgot-password/g, '/${locale}/forgot-password');
    content = content.replace(/\/en\/sign-up/g, '/${locale}/sign-up');
    content = content.replace(/\/en\/student\/profile/g, '/${locale}/student/profile');
    content = content.replace(/\/en\/parent\/profile/g, '/${locale}/parent/profile');
    
    // For string interpolation to work correctly with `/en/` replacement:
    content = content.replace(/router\.push\("\/\$\{locale\}\/forgot-password"\)/g, 'router.push(`/${locale}/forgot-password`)');
    content = content.replace(/router\.push\("\/\$\{locale\}\/sign-up"\)/g, 'router.push(`/${locale}/sign-up`)');
    content = content.replace(/router\.push\("\/\$\{locale\}\/student\/profile"\)/g, 'router.push(`/${locale}/student/profile`)');
    content = content.replace(/router\.push\("\/\$\{locale\}\/parent\/profile"\)/g, 'router.push(`/${locale}/parent/profile`)');


    // Replace Toasts
    content = content.replace(/"Please enter your email and password\."/g, 't("enterEmailPass")');
    content = content.replace(/"Incorrect email or password\."/g, 't("incorrectCredentials")');
    content = content.replace(/"Please confirm your email address before logging in\."/g, 't("emailNotConfirmed")');
    content = content.replace(/"Unable to sign you in\. Please try again\."/g, 't("unableToSignIn")');
    content = content.replace(/"We couldn't verify your account\."/g, 't("unableToSignIn")');
    content = content.replace(/"Your account is currently inactive\. Please contact support\."/g, 't("accountInactive")');
    content = content.replace(/"We couldn't determine your account type\."/g, 't("noRoleError")');
    content = content.replace(/"Your account does not have an assigned role\. Please contact support\."/g, 't("unsupportedRole")');
    content = content.replace(/"Your account does not have a valid assigned role\."/g, 't("unsupportedRole")');
    content = content.replace(/"Your assigned account role could not be found\."/g, 't("invalidRole")');
    content = content.replace(/"Welcome back!"/g, 't("welcomeBackSuccess")');
    content = content.replace(/"Your account role is not supported\. Please contact support\."/g, 't("unsupportedRole")');
    content = content.replace(/"Something went wrong while logging in\. Please try again\."/g, 't("generalError")');

    // Replace JSX Text
    content = content.replace(/>\s*Welcome Back\s*</g, '>{t("welcomeBack")}<');
    content = content.replace(/>\s*Sign in to access your account\.\s*</g, '>{t("signInText")}<');
    content = content.replace(/>\s*Email Address\s*</g, '>{t("emailLabel")}<');
    content = content.replace(/placeholder="Enter your email"/g, 'placeholder={t("emailPlaceholder")}');
    content = content.replace(/>\s*Password\s*</g, '>{t("passwordLabel")}<');
    content = content.replace(/>\s*Forgot password\?\s*</g, '>{t("forgotPassword")}<');
    content = content.replace(/placeholder="Enter your password"/g, 'placeholder={t("passwordPlaceholder")}');
    content = content.replace(/>\s*Signing in\.\.\.\s*</g, '>{t("signingIn")}<');
    content = content.replace(/>\s*Sign In\s*</g, '>{t("signInButton")}<');
    content = content.replace(/>\s*New to Young Leaders Academy\?\s*</g, '>{t("newTo")}<');
    content = content.replace(/>\s*Create an Account\s*</g, '>{t("createAccount")}<');
    content = content.replace(/>\s*Secure account access powered by\s+Young Leaders Academy\.\s*</g, '>{t("secureAccess")}<');

    fs.writeFileSync(filePath, content);
}

function refactorSignUp() {
    const filePath = './app/[locale]/sign-up/page.tsx';
    let content = fs.readFileSync(filePath, 'utf8');

    // Add imports
    if (!content.includes('next-intl')) {
        content = content.replace(
            'import { useRouter } from "next/navigation";',
            'import { useRouter } from "next/navigation";\nimport { useTranslations, useLocale } from "next-intl";'
        );
    }

    // Add hooks
    content = content.replace(
        'const router = useRouter();',
        'const router = useRouter();\n    const t = useTranslations("Auth");\n    const locale = useLocale();'
    );

    // Replace router.push hardcoded "/en"
    content = content.replace(/\/en/g, '/${locale}');
    content = content.replace(/router\.push\("\/\$\{locale\}"\)/g, 'router.push(`/${locale}`)');
    content = content.replace(/router\.push\("\/\$\{locale\}\/login"\)/g, 'router.push(`/${locale}/login`)');

    // Replace Toasts
    content = content.replace(/"Please select a role\."/g, 't("selectRoleError")');
    content = content.replace(/"Please enter your first name\."/g, 't("firstNameError")');
    content = content.replace(/"Please enter your last name\."/g, 't("lastNameError")');
    content = content.replace(/"Please enter your email address\."/g, 't("emailError")');
    content = content.replace(/"Please enter your date of birth\."/g, 't("dobError")');
    content = content.replace(/"Please enter your phone number\."/g, 't("phoneError")');
    content = content.replace(/"Please select your country\."/g, 't("countryError")');
    content = content.replace(/"Please select your preferred language\."/g, 't("langError")');
    content = content.replace(/"Please enter a password\."/g, 't("passwordError")');
    content = content.replace(/"Please confirm your password\."/g, 't("confirmPasswordError")');
    content = content.replace(/"Passwords do not match\."/g, 't("passwordMatchError")');
    content = content.replace(/"You must agree to the Terms & Conditions\."/g, 't("termsError")');
    content = content.replace(/"You must acknowledge the Privacy Policy\."/g, 't("privacyError")');
    content = content.replace(/"Student account created successfully!"/g, 't("studentSuccess")');
    content = content.replace(/"Parent account created successfully!"/g, 't("parentSuccess")');
    content = content.replace(/"Something went wrong\. Please try again\."/g, 't("signupError")');
    
    content = content.replace(/"Please select at least one role!"/g, 't("selectOneRole")');
    content = content.replace(/"Account created, but profile setup failed\."/g, 't("setupFailedProfile")');
    content = content.replace(/"Account created, but role setup failed\."/g, 't("setupFailedRole")');
    content = content.replace(/"Account created, but the selected role was not found\."/g, 't("roleNotFound")');
    content = content.replace(/"Account created, but role assignment failed\."/g, 't("roleAssignFailed")');
    content = content.replace(/"Unable to create account\."/g, 't("unableCreate")');

    // Replace JSX Text
    content = content.replace(/>\s*Please let us know your identity!\s*</g, '>{t("selectRoleTitle")}<');
    content = content.replace(/>\s*Student\s*</g, '>{t("student")}<');
    content = content.replace(/>\s*Parent\s*</g, '>{t("parent")}<');
    content = content.replace(/>\s*Next\s*</g, '>{t("next")}<');
    content = content.replace(/>\s*Create your Student Account\s*</g, '>{t("createStudentTitle")}<');
    content = content.replace(/>\s*Create your Parent Account\s*</g, '>{t("createParentTitle")}<');
    content = content.replace(/>\s*Enter your information below\.\s*</g, '>{t("enterInfo")}<');
    content = content.replace(/>\s*First Name\s*</g, '>{t("firstName")}<');
    content = content.replace(/placeholder="Enter first name"/g, 'placeholder={t("firstNamePlaceholder")}');
    content = content.replace(/>\s*Last Name\s*</g, '>{t("lastName")}<');
    content = content.replace(/placeholder="Enter last name"/g, 'placeholder={t("lastNamePlaceholder")}');
    content = content.replace(/>\s*Email\s*</g, '>{t("email")}<');
    content = content.replace(/placeholder="Enter your email address"/g, 'placeholder={t("emailPlaceholderSignUp")}');
    content = content.replace(/>\s*Date of Birth\s*</g, '>{t("dob")}<');
    content = content.replace(/>\s*Phone Number\s*</g, '>{t("phone")}<');
    content = content.replace(/placeholder="Enter your phone number"/g, 'placeholder={t("phonePlaceholder")}');
    content = content.replace(/>\s*Country\s*</g, '>{t("country")}<');
    content = content.replace(/>\s*Select your country\s*</g, '>{t("selectCountry")}<');
    content = content.replace(/>\s*Preferred Language\s*</g, '>{t("preferredLanguage")}<');
    content = content.replace(/>\s*Password\s*</g, '>{t("password")}<');
    content = content.replace(/placeholder="Create a password \(min 6 chars\)"/g, 'placeholder={t("passwordPlaceholderSignUp")}');
    content = content.replace(/>\s*Confirm Password\s*</g, '>{t("confirmPassword")}<');
    content = content.replace(/placeholder="Confirm your password"/g, 'placeholder={t("confirmPasswordPlaceholder")}');
    content = content.replace(/>\s*I agree to the Terms & Conditions\s*</g, '>{t("agreeTerms")}<');
    content = content.replace(/>\s*I acknowledge the Privacy Policy\s*</g, '>{t("agreePrivacy")}<');
    content = content.replace(/>\s*Create Account\s*</g, '>{t("createAccountBtn")}<');
    content = content.replace(/>\s*Creating account\.\.\.\s*</g, '>{t("creatingAccount")}<');
    content = content.replace(/>\s*Already have an account\?\s*</g, '>{t("alreadyHaveAccount")}<');
    content = content.replace(/>\s*Sign in here\s*</g, '>{t("signIn")}<');
    content = content.replace(/>\s*Back\s*</g, '>{t("back")}<');
    
    // Fix ternary operators that were broken by previous JSX replacement
    content = content.replace(/\{\s*selectedRole === "student"\s*\?\s*\{t\("createStudentTitle"\)\}\s*:\s*\{t\("createParentTitle"\)\}\s*\}/g, '{selectedRole === "student" ? t("createStudentTitle") : t("createParentTitle")}');

    fs.writeFileSync(filePath, content);
}

try {
    refactorLogin();
    refactorSignUp();
    console.log("Refactoring complete!");
} catch (e) {
    console.error(e);
}
