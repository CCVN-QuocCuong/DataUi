import * as Yup from "yup";

/**
 * Declare schema for validation create user form
 */
export const AddUserValidation = Yup.object().shape({
  email: Yup.string().trim().required("Email is required.").email("Email is invalid."),
  username: Yup.string()
    .trim()
    .required("Business username is required.")
    .max(20, "Must be less than 20 digits."),

  name: Yup.string()
    .trim()
    .required("Full name is required.")
    .max(100, "Must be less than 100 characters."),

  position: Yup.string()
    .trim()
    .required("Position is required.")
    .max(120, "Must be less than 120 characters."),

  phone_number: Yup.string()
    .required("Phone number is required.")
    .min(10, "Must be greater than 9 digits.")
    .max(20, "Must be less than 20 digits."),

  password: Yup.string()
    .when('is_random_password', {
      is: false,
      then: Yup.string().required("Password is required.")
        .matches(
          //eslint-disable-next-line
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
          "Password must be at least 8 characters and contain at least three out of the following: upper case letter, lower case letter, number, and special character."
        ),
    }),

  reenter_password: Yup.string()
    .when('is_random_password', {
      is: false,
      then: Yup.string().required("Confirm password is required.")
        .oneOf([Yup.ref("password"), null], "Passwords do not match.")
    }),
});

