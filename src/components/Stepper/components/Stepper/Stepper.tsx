import React from 'react';
import clsx from 'clsx';

import Step from '../Step/Step';
import { StepperProps } from './StepperTypes';
import { useStepperStyles } from './StepperStyles';
import StepperContext from './StepperContext';

const Stepper: React.FC<StepperProps> = ({
  steps,
  children,
  connectorStateColors = false,
  className = '',
  stepClassName = '',
  activeStep = 0,
  styleConfig,
  connectorStyleConfig,
  hideConnectors = false,
  nonLinear = false,
  ...rest
}) => {
  const classes = useStepperStyles();

  const contextValue = React.useMemo(
    () => ({
      activeStep,
      hideConnectors,
      nonLinear,
      connectorStateColors: connectorStateColors && !nonLinear,
      connectorStyleConfig,
    }),
    [
      activeStep,
      hideConnectors,
      nonLinear,
      connectorStateColors,
      connectorStyleConfig,
    ]
  );

  const useStepsProp = steps instanceof Array && steps.length > 0;
  const stepsArray: any = useStepsProp ? steps : React.Children.toArray(children);

  const stepsToRender = stepsArray!.map((step, index) => {
    if (!useStepsProp && !React.isValidElement(step)) return null;

    const stepProps = {
      className: stepClassName,
      styleConfig,
      index,
    };

    return (
      <div key={index} id="RFS-StepContainer" className={classes.StepContainer}>
        {React.isValidElement(step) ? (
          React.cloneElement(step, {
            ...stepProps,
            ...step,
          })
        ) : (
          <Step {...stepProps} {...step} />
        )}
      </div>
    );
  });

  return (
    <StepperContext.Provider value={contextValue}>
      <div
        id="RFS-StepperContainer"
        className={clsx(classes.StepperContainer, className)}
        {...rest}
      >
        {stepsToRender}
      </div>
    </StepperContext.Provider>
  );
};

export default Stepper;
