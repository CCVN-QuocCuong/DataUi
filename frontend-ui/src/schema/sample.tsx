import * as Yup from "yup";

const NumbericRegex = /^\d{0,25}(\.\d{0,8})?$/;
const JobnoRegex = /^[.]*\d{5,15}$/;

/**
 * Declare schema for validation edit sample form
 */
export const SampleValidation = Yup.object().shape({
    jobnumber: Yup.string().trim().transform((_, value) => {
        return value.replace('.', '');
    }).required('Job No is required.')
        .min(5, 'Must be greater than or equal to 5 characters.')
        .max(15, 'Must be less than or equal to 15 characters.')
        .matches(JobnoRegex, 'Must be matches only contains number and full stop.'),
    siteid: Yup.string().trim().max(50, 'Must be less than or equal to 50 characters.').nullable(true),
    pointname: Yup.string().trim().max(50, 'Must be less than or equal to 50 characters.').required('Sample Name is required.'),
    duplicatename: Yup.string().trim().max(50, 'Must be less than or equal to 50 characters.').nullable(true),
    objective: Yup.string().required('Objective is required.'),
    sampletype: Yup.string().required('Sample Type is required.'),
    objectiveother: Yup.string().trim().max(50, 'Must be less than or equal to 50 characters.').nullable(true),
    fromdepth: Yup.string().trim().matches(NumbericRegex, 'Must be matches numberic(25,8).').required('Depth From is required.'),
    todepth: Yup.string().trim().matches(NumbericRegex, 'Must be matches numberic(25,8).').required('Depth To is required.'),
    samplematerialtype: Yup.string().trim().required('Depth To is required.'),
    barcode: Yup.string().max(20, 'Must be less than or equal to 20 characters.').required('Barcode is required.'),
    containertype: Yup.string().trim().required('Container Type is required.'),
    collectiondate: Yup.string().trim().required('Collection date is required.'),
});
