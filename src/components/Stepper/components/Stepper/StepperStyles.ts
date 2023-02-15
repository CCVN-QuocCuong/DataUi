import { createUseStyles } from 'react-jss';

export const useStepperStyles = createUseStyles({
  StepperContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    flexDirection: 'row',
    padding: 60,
    fontFamily: 'Arial, Helvetica, sans-serif',
  },
  StepContainer: {
    flex: 1,
    position: 'relative',
    paddingLeft: 8,
    paddingRight: 8,
  },
});
