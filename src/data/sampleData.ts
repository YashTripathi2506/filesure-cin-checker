/**
 * Sample input for "Try sample data". Every line is SYNTHETIC test data except the two examples that
 * appear in the FileSure assignment brief. None of these should be treated as real companies.
 */
export const SAMPLE_DATA = [
  'L17110MH1973PLC019786', // example from the assignment brief
  'U72900KA2021PTC123456', // synthetic: unlisted private company
  'U74999DL2019OPC123456', // synthetic: one person company
  'U40100DL1990GOI054321', // synthetic: Government of India company
  'U40101TG2004SGC000001', // synthetic: state government company
  'AAA-1234', // example from the assignment brief
  'abb-3106', // lowercase LLPIN: accepted with a note
  '  U85300UT2020NPL000123  ', // spaces around it: ignored with a note
  'L17110MH1973PLC01978', // too short
  'U72900XX2021PTC123456', // unrecognised state code
  'U72900KA2999PTC123456', // future year
  'AAA1234', // missing hyphen
  'L17110MH1973PLC019786', // duplicate of line 1
  'hello world',
].join('\n');
