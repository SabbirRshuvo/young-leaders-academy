const fs = require('fs');

const studentFile = 'app/[locale]/student/profile/page.tsx';
const parentFile = 'app/[locale]/parent/profile/page.tsx';

function refactorFile(filePath) {
  let file = fs.readFileSync(filePath, 'utf8');

  const replaceText = (search, key) => {
    // Escape regex chars
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Allow any whitespace around the text, inside ><
    const regex = new RegExp(`>\\s*${escapedSearch}\\s*<`, 'g');
    file = file.replace(regex, `>\n      {t("${key}")}\n    <`);
  };

  const strings = {
    "Loading your profile...": "loadingProfile",
    "Profile not found": "profileNotFound",
    "We couldn't find your profile information.": "profileNotFoundDesc",
    "Back to Home": "backToHome",
    "Back": "back",
    "Student Profile": "studentProfile",
    "Parent Profile": "parentProfile",
    "Edit Profile": "editProfile",
    "Personal Information": "personalInfo",
    "Your basic account information": "personalInfoDesc",
    "Location & Language": "locationLanguage",
    "Your location and language preferences": "locationLanguageDesc",
    "Education": "education",
    "Your current academic information": "educationDesc",
    "Parent Consent": "parentConsent",
    "Your account consent status": "parentConsentDesc",
    "Current Status": "currentStatus",
    "Account Type": "accountType",
    "Your Young Leaders Academy account": "accountTypeDesc",
    "Student Account": "studentAccount",
    "Parent Account": "parentAccount",
    "Basic Information": "basicInfo",
    "Update your personal details": "basicInfoDesc",
    "Preferences": "preferences",
    "Communication": "communication",
    "How you prefer to be contacted": "communicationDesc",
    "Save Changes": "saveChanges",
    "Cancel": "cancel",
    "Saving...": "saving",
    "First Name": "firstName",
    "Last Name": "lastName",
    "Email Address": "emailAddress",
    "Phone Number": "phoneNumber",
    "Date of Birth": "dateOfBirth",
    "Country": "country",
    "Preferred Language": "preferredLanguage",
    "Gender": "gender",
    "School Name": "schoolName",
    "Grade Level": "gradeLevel",
    "City": "city",
    "Preferred Contact Method": "preferredContactMethod",
    "Male": "male",
    "Female": "female",
    "Prefer not to say": "preferNotToSay"
  };

  for (const [text, key] of Object.entries(strings)) {
    replaceText(text, key);
  }

  // Also replace 'Student' and 'Parent' badges
  replaceText("Student", "student");
  replaceText("Parent", "parent");

  fs.writeFileSync(filePath, file);
}

refactorFile(studentFile);
refactorFile(parentFile);
console.log('Final refactor complete');
