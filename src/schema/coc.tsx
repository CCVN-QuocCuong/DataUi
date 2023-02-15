import * as Yup from "yup";

const PhoneRegex = /^[+]*\d{6,20}$/;
const JobnoRegex = /^[0-9.]+$/;

/**
 * Declare schema for validation generate COC form
 */
export const AddCOCValidation = Yup.object().shape({
    jobno: Yup.string().trim()
        .required('Job No is required.')
        .test(
            'string-min',
            'Must be greater than or equal to 5 digits.',
            function stringLength(value: any) {
                if (value?.split('.')?.join('')?.length < 5)
                    return false;

                return true;
            }
        )
        .test(
            'string-max',
            'Must be less than or equal to 15 characters.',
            function stringLength(value: any) {
                if (value?.split('.')?.join('')?.length > 15)
                    return false;

                return true;
            }
        )
        .matches(JobnoRegex, 'Must be matches only contains number and full stop.'),
    jobphase: Yup.string().trim().max(50, 'Must be less than or equal to 50 characters').nullable(true),
    jobtask: Yup.string().trim().max(50, 'Must be less than or equal to 50 characters').nullable(true),
    companyid: Yup.number().notRequired(),
    labquoteno: Yup.string().trim().max(50, 'Must be less than or equal to 50 characters').nullable(true),
    primarycontact: Yup.string().trim().max(250, 'Must be less than or equal to 250 characters').nullable(true),
    createdby: Yup.string().trim().max(250, 'Must be less than or equal to 250 characters').nullable(true),
    ttcontactphone: Yup.string().trim().notRequired().matches(PhoneRegex, {
        message: "Please enter a phone number.",
        excludeEmptyString: true,
    })
        .max(20, "Must be less than 20 digits.").nullable(true),
    ttemailaddress: Yup.string().trim().email("Please enter a email.").max(250, 'Must be less than or equal to 250 characters').nullable(true),
    emailother: Yup.string().trim().email("Please enter a email.").max(250, 'Must be less than or equal to 250 characters').nullable(true),
    labid: Yup.number().notRequired(),
    priority: Yup.string().trim().max(50, 'Must be less than or equal to 50 characters').nullable(true),
    siteid: Yup.string().trim().max(50, 'Must be less than or equal to 50 characters').nullable(true),
    siteaddress: Yup.string().trim().max(1024, 'Must be less than or equal to 1024 characters').nullable(true),
    labreference: Yup.string().trim().max(50, 'Must be less than or equal to 50 characters').nullable(true),
    objective: Yup.string().trim().max(50, 'Must be less than or equal to 50 characters').nullable(true),
    labaddress: Yup.string().trim().max(1024, 'Must be less than or equal to 1024 characters').nullable(true),
    address: Yup.string().trim().max(1024, 'Must be less than or equal to 1024 characters').nullable(true),
    comment: Yup.string().trim().max(1024, 'Must be less than or equal to 1024 characters').nullable(true),
    note: Yup.string().trim().nullable(true),
    notecomment: Yup.string().trim().when('note', {
        is: 'Other update, please see comments box.',
        then: Yup.string()
            .required('Please enter a comment')
            .max(100, 'Must be less than or equal to 100 characters'),
        otherwise: Yup.string(),
    }),
});

