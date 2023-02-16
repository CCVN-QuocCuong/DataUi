import * as Yup from "yup";

/**
 * Declare schema for validation login form
 */
export const LoginValidation = Yup.object().shape({
  email: Yup.string().required("Email is required.").email("Email is invalid."),
  password: Yup.string()
    .required("Password is required.")
});

/**
 * Declare schema for validation form password form
 */
export const SendEmailForgotPasswordValidation = Yup.object().shape({
  email: Yup.string().required("Email is required.").email("Email is invalid."),
});

/**
 * Declare schema for validation change password when fogot password form
 */
export const ChangePasswordForgotPasswordValidation = Yup.object().shape({
  code: Yup.string().required("Verify code is required."),
  password: Yup.string()
    .required("Password is required.")
    .matches(
      //eslint-disable-next-line
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
      "The password is not strong enough. Make sure it follows the rules below."
    ),
  confirmPassword: Yup.string()
    .required("Confirm password is required.")
    .oneOf([Yup.ref("password"), null], "Passwords do not match."),
});

/**
 * Declare schema for validation reset password first time login form
 */
export const FirstTimeResetPasswordValidation = Yup.object().shape({
  password: Yup.string()
    .required("Current Password is required."),
  new_password: Yup.string()
    .required("New Password is required.")
    .matches(
      //eslint-disable-next-line
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
      "Password must be at least 8 characters and contain at least three out of the following: upper case letter, lower case letter, number, and special character."
    ),
  confirmPassword: Yup.string()
    .required("Re-enter New Password is required.")
    .oneOf([Yup.ref("new_password"), null], "Passwords do not match."),
});

/**
 * Declare schema for validation edit my account form
 */
export const MyAccountValidation = Yup.object().shape({
  name: Yup.string()
    .required("Full name is required.")
    .max(120, "Must be less than 121 characters."),
  phone_number: Yup.string()
    .required("Phone number is required.")
    .min(10, "Must be greater than 9 digits.")
    .max(20, "Must be less than 21 digits."),
});

/**
 * Declare schema for validation user change password form
 */
export const ChangePasswordMyAccountValidation = Yup.object().shape({
  old_password: Yup.string()
    .required("Old password is required."),
  new_password: Yup.string()
    .required("New Password is required.")
    .matches(
      //eslint-disable-next-line
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
      "Password must be at least 8 characters and contain at least three out of the following: upper case letter, lower case letter, number, and special character."
    ),
  reenter_password: Yup.string()
    .required("Re-enter New Password is required.")
    .oneOf([Yup.ref("new_password"), null], "Confirm password do not match."),
});

