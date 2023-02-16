type Sample = {
    [key: string]: any;
};

/**
 * Function to concat sample name 
 * @param {object} sample
 */
export const concatSampleName = (sample: Sample) => {
    let sampleName = sample?.pointname || "";
    if (!isNaN(sample?.fromdepth * 1)) {
        sampleName = sampleName + "_" + (sample?.fromdepth * 1).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }) + "m";
    }
    if (!isNaN(sample?.todepth * 1)) {
        sampleName = sampleName + "_" + (sample?.todepth * 1).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }) + "m";
    }
    return sampleName;
}